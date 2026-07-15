// Twilio webhooks. Twilio posts application/x-www-form-urlencoded and signs
// every request with X-Twilio-Signature = base64(HMAC-SHA1(authToken,
// url + concat(sorted param key+value))). We validate on every request and
// reject unsigned traffic (brief §6.2). The auth token is never logged.

import { Router } from 'express';
import express from 'express';
import crypto from 'node:crypto';
import { parseInbound, processInbound } from '../messaging/router.js';
import { prisma } from '../db.js';

export const twilioRouter = Router();
twilioRouter.use(express.urlencoded({ extended: false }));

function publicUrl(path: string, req: express.Request): string {
  const base = process.env.PUBLIC_API_URL?.replace(/\/$/, '');
  if (base) return `${base}${path}`;
  // Fallback: reconstruct from the request (works when not behind a rewriting proxy).
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
}

export function validTwilioSignature(req: express.Request, fullUrl: string): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return process.env.NODE_ENV !== 'production'; // dev without Twilio: allow
  const signature = req.header('X-Twilio-Signature') || '';
  const params = req.body as Record<string, string>;
  const data = fullUrl + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const expected = crypto.createHmac('sha1', token).update(Buffer.from(data, 'utf-8')).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Inbound member messages (SMS + WhatsApp share the webhook; the From prefix
// disambiguates). Reply with empty TwiML — actual replies go out via the REST
// API so multi-message responses work uniformly.
twilioRouter.post('/inbound', async (req, res) => {
  if (!validTwilioSignature(req, publicUrl('/api/twilio/inbound', req))) {
    return res.status(403).send('invalid signature');
  }
  const inbound = parseInbound(req.body as Record<string, string>);
  if (inbound) {
    // Don't block Twilio's 15s webhook timeout on our processing.
    processInbound(inbound).catch((e) => console.error('inbound processing failed', e));
  }
  res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
});

// Delivery status callbacks → keep MessageLog.status current.
twilioRouter.post('/status', async (req, res) => {
  if (!validTwilioSignature(req, publicUrl('/api/twilio/status', req))) {
    return res.status(403).send('invalid signature');
  }
  const sid = (req.body as any).MessageSid;
  const status = (req.body as any).MessageStatus;
  if (sid && status) {
    await prisma.messageLog.updateMany({ where: { twilioSid: sid }, data: { status } });
  }
  res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
});

// Dev-only conversation simulator: feed the engine without Twilio and get the
// replies back as JSON. Never mounted in production.
if (process.env.NODE_ENV !== 'production') {
  twilioRouter.post('/simulate', express.json(), async (req, res) => {
    const { from, body, channel } = req.body || {};
    if (!from || typeof body !== 'string') return res.status(400).json({ error: 'from and body required' });
    const replies = await processInbound({
      channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      from,
      body,
      mediaUrl: null,
      providerSid: null,
      buttonPayload: null,
    });
    res.json({ replies: replies.map((r) => ({ templateKey: r.templateKey, body: r.body })) });
  });
}
