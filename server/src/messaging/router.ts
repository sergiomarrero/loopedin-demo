// Messaging router — glue between webhook, engine, and adapters. Owns
// MessageLog writes (the compliance/consent record) and outbound delivery.

import { prisma } from '../db.js';
import { handleInbound } from './engine.js';
import { smsAdapter } from './adapters/sms.js';
import { whatsappAdapter } from './adapters/whatsapp.js';
import type { Channel, ChannelAdapter, InboundMessage, OutboundMessage } from './types.js';

const ADAPTERS: ChannelAdapter[] = [whatsappAdapter, smsAdapter]; // whatsapp first: prefix disambiguates

export function adapterFor(channel: Channel): ChannelAdapter {
  return channel === 'whatsapp' ? whatsappAdapter : smsAdapter;
}

// Normalize a raw Twilio webhook body into an InboundMessage via whichever
// adapter recognizes it.
export function parseInbound(params: Record<string, string>): InboundMessage | null {
  for (const a of ADAPTERS) {
    const m = a.parseInbound(params);
    if (m) return m;
  }
  return null;
}

async function memberIdForPhone(phone: string): Promise<string | null> {
  const st = await prisma.conversationState.findUnique({ where: { phone } });
  return st?.memberId ?? null;
}

async function log(entry: {
  phone: string; channel: Channel; direction: 'inbound' | 'outbound'; body: string;
  mediaUrl?: string | null; questionId?: string | null; templateKey?: string | null;
  twilioSid?: string | null; status?: string | null;
}) {
  try {
    await prisma.messageLog.create({
      data: {
        memberId: await memberIdForPhone(entry.phone),
        channel: entry.channel,
        direction: entry.direction,
        body: entry.body,
        mediaUrl: entry.mediaUrl ?? null,
        questionId: entry.questionId ?? null,
        templateKey: entry.templateKey ?? null,
        twilioSid: entry.twilioSid ?? null,
        status: entry.status ?? null,
      },
    });
  } catch (e) {
    console.error('messagelog write failed', e);
  }
}

// Send one outbound message to a phone over a channel, logging it. When the
// adapter isn't configured (local dev / simulator), the message is logged with
// status 'skipped' and still returned to the caller.
export async function sendMessage(phone: string, channel: Channel, msg: OutboundMessage): Promise<void> {
  const adapter = adapterFor(channel);
  if (!adapter.enabled()) {
    await log({ phone, channel, direction: 'outbound', body: msg.body, mediaUrl: msg.mediaUrl, questionId: msg.questionId, templateKey: msg.templateKey, status: 'skipped' });
    return;
  }
  const result = await adapter.send(phone, msg);
  await log({
    phone, channel, direction: 'outbound', body: msg.body,
    mediaUrl: msg.mediaUrl, questionId: msg.questionId, templateKey: msg.templateKey,
    twilioSid: result.providerSid ?? null,
    status: result.ok ? 'queued' : 'failed',
  });
  if (!result.ok) console.error(`outbound ${channel} to ${phone} failed:`, result.error);
}

// Preferred channel for a phone: whatever they last messaged us on, upgraded
// to WhatsApp when known + enabled (brief §9.6).
export async function preferredChannel(phone: string): Promise<Channel> {
  const st = await prisma.conversationState.findUnique({ where: { phone } });
  if (st?.channel === 'whatsapp' && whatsappAdapter.enabled()) return 'whatsapp';
  return 'sms';
}

// Full inbound pipeline: log → engine → send replies. Returns the replies so
// the dev simulator can display them.
export async function processInbound(inbound: InboundMessage): Promise<OutboundMessage[]> {
  await log({
    phone: inbound.from, channel: inbound.channel, direction: 'inbound',
    body: inbound.body, mediaUrl: inbound.mediaUrl, twilioSid: inbound.providerSid, status: 'received',
  });
  const caps = adapterFor(inbound.channel).capabilities;
  let replies: OutboundMessage[] = [];
  try {
    replies = await handleInbound(inbound, caps);
  } catch (e) {
    console.error('engine error', e);
    return [];
  }
  for (const msg of replies) {
    await sendMessage(inbound.from, inbound.channel, msg);
  }
  return replies;
}
