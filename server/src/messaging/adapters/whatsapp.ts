// WhatsApp adapter — Twilio WhatsApp API. Built now, feature-flagged off
// (WHATSAPP_ENABLED=false) until Meta approval lands; test against the Twilio
// WhatsApp Sandbox by setting TWILIO_WHATSAPP_FROM to the sandbox number.
//
// v1 renders the same numbered-plain-text bodies as SMS (the engine writes
// against the lowest common denominator) but CAN attach media natively.
// Native quick-reply buttons/lists arrive with approved Content API templates
// (v1.1) — the `capabilities` flags below already advertise them so the
// engine's media behavior upgrades immediately.

import type { ChannelAdapter, InboundMessage, OutboundMessage, SendResult } from '../types.js';
import { twilioSend } from './sms.js';

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function waAddr(phone: string): string {
  return phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
}

export const whatsappAdapter: ChannelAdapter = {
  channel: 'whatsapp',
  capabilities: { buttons: true, lists: true, media: true, voiceNotes: true },

  enabled() {
    return (
      (env('WHATSAPP_ENABLED') || 'false').toLowerCase() === 'true' &&
      Boolean(env('TWILIO_ACCOUNT_SID') && env('TWILIO_AUTH_TOKEN') && env('TWILIO_WHATSAPP_FROM'))
    );
  },

  async send(to: string, msg: OutboundMessage): Promise<SendResult> {
    const params: Record<string, string> = {
      To: waAddr(to),
      From: waAddr(env('TWILIO_WHATSAPP_FROM')!),
      Body: msg.body,
    };
    if (msg.mediaUrl) params.MediaUrl = msg.mediaUrl;
    const statusUrl = env('PUBLIC_API_URL');
    if (statusUrl) params.StatusCallback = `${statusUrl.replace(/\/$/, '')}/api/twilio/status`;
    return twilioSend(params);
  },

  parseInbound(params: Record<string, string>): InboundMessage | null {
    const from = params.From || '';
    if (!from.startsWith('whatsapp:')) return null; // not ours
    return {
      channel: 'whatsapp',
      from: from.slice('whatsapp:'.length),
      body: (params.Body || params.ButtonText || '').trim(),
      mediaUrl: Number(params.NumMedia || 0) > 0 ? params.MediaUrl0 || null : null,
      providerSid: params.MessageSid || null,
      buttonPayload: params.ButtonPayload || null,
    };
  },
};
