import { z } from 'zod';

const textMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string().optional(),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
  interactive: z
    .object({
      type: z.string(),
      button_reply: z.object({ id: z.string(), title: z.string() }).optional(),
      list_reply: z.object({ id: z.string(), title: z.string() }).optional(),
    })
    .optional(),
});

export const webhookPayloadSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string().optional(),
      changes: z.array(
        z.object({
          field: z.string().optional(),
          value: z.object({
            messaging_product: z.string().optional(),
            contacts: z
              .array(z.object({ wa_id: z.string(), profile: z.object({ name: z.string() }).partial().optional() }))
              .optional(),
            messages: z.array(textMessageSchema).optional(),
            statuses: z.array(z.unknown()).optional(),
          }),
        }),
      ),
    }),
  ),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type IncomingMessage = z.infer<typeof textMessageSchema>;

export interface NormalizedMessage {
  from: string;
  messageId: string;
  text: string;
}

export function extractMessages(payload: WebhookPayload): NormalizedMessage[] {
  const result: NormalizedMessage[] = [];
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      for (const message of change.value.messages ?? []) {
        const text =
          message.text?.body ??
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title;
        if (!text) continue;
        result.push({ from: message.from, messageId: message.id, text });
      }
    }
  }
  return result;
}
