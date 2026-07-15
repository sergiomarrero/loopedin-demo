// SMS adapter — Twilio Programmable Messaging (toll-free number), via the REST
// API directly (fetch + Basic auth; no SDK dependency). Lowest-common-
// denominator channel: plain text, numbered options, no media (media-heavy
// content deep-links to the app instead).

import type { ChannelAdapter, InboundMessage, OutboundMessage, SendResult } from '../types.js';

const API = 'https://api.twilio.com/2010-04-01';

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export async function twilioSend(params: Record<string, string>): Promise<SendResult> {
  const sid = env('TWILIO_ACCOUNT_SID');
  const token = env('TWILIO_AUTH_TOKEN');
  if (!sid || !token) return { ok: false, error: 'twilio not configured' };
  try {
    const res = await fetch(`${API}/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message || `twilio ${res.status}` };
    return { ok: true, providerSid: data.sid || null };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network error' };
  }
}

export const smsAdapter: ChannelAdapter = {
  channel: 'sms',
  capabilities: { buttons: false, lists: false, media: false, voiceNotes: false },

  enabled() {
    return Boolean(env('TWILIO_ACCOUNT_SID') && env('TWILIO_AUTH_TOKEN') && env('TWILIO_SMS_FROM'));
  },

  async send(to: string, msg: OutboundMessage): Promise<SendResult> {
    const params: Record<string, string> = {
      To: to,
      From: env('TWILIO_SMS_FROM')!,
      Body: msg.body,
    };
    const statusUrl = env('PUBLIC_API_URL');
    if (statusUrl) params.StatusCallback = `${statusUrl.replace(/\/$/, '')}/api/twilio/status`;
    return twilioSend(params);
  },

  parseInbound(params: Record<string, string>): InboundMessage | null {
    const from = params.From || '';
    if (!from || from.startsWith('whatsapp:')) return null; // not ours
    return {
      channel: 'sms',
      from,
      body: (params.Body || '').trim(),
      mediaUrl: Number(params.NumMedia || 0) > 0 ? params.MediaUrl0 || null : null,
      providerSid: params.MessageSid || null,
      buttonPayload: null,
    };
  },
};
