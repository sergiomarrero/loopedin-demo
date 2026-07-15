// Messaging layer — shared types. ONE conversation engine, thin channel
// adapters. All business logic lives in the engine; adapters only translate
// transport (see LoopedIn Messaging Layer Brief §2).

export type Channel = 'sms' | 'whatsapp';

// A normalized inbound message, whatever the transport.
export interface InboundMessage {
  channel: Channel;
  from: string; // E.164 phone (no channel prefix)
  body: string;
  mediaUrl?: string | null;
  providerSid?: string | null; // Twilio MessageSid
  // WhatsApp interactive replies (button/list taps) normalize into `body` as
  // the option's payload text; `buttonPayload` keeps the raw id when present.
  buttonPayload?: string | null;
}

// What the engine wants to say — adapters decide how to render it.
export interface OutboundMessage {
  body: string; // lowest-common-denominator plain text (numbered options inline)
  templateKey: string; // which template produced this (for MessageLog + WA templates)
  // Optional structured extras that capable channels (WhatsApp) upgrade to
  // native buttons/media. SMS ignores these — the body already carries the
  // numbered fallback.
  options?: string[]; // quick-reply choices, in order (1-based over SMS)
  mediaUrl?: string | null;
  questionId?: string | null; // for MessageLog attribution
}

export interface SendResult {
  ok: boolean;
  providerSid?: string | null;
  error?: string;
}

export interface ChannelCapabilities {
  buttons: boolean;
  lists: boolean;
  media: boolean;
  voiceNotes: boolean;
}

// Both adapters (sms, whatsapp) implement this.
export interface ChannelAdapter {
  channel: Channel;
  capabilities: ChannelCapabilities;
  enabled(): boolean;
  send(to: string, msg: OutboundMessage): Promise<SendResult>;
  // Normalize a raw webhook body (Twilio posts urlencoded params) into an
  // InboundMessage, or null if this adapter doesn't own the message.
  parseInbound(params: Record<string, string>): InboundMessage | null;
}

// Engine reply: zero or more outbound messages to the same phone.
export interface EngineResult {
  replies: OutboundMessage[];
}
