import type { Config } from '../config.js';
import type { Logger } from '../logger.js';

export interface WhatsAppClient {
  sendText(to: string, body: string): Promise<void>;
}

export function createWhatsAppClient(config: Config, logger: Logger): WhatsAppClient {
  const url = `https://graph.facebook.com/${config.WHATSAPP_GRAPH_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  return {
    async sendText(to, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body },
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        logger.error('Fallo al enviar mensaje de WhatsApp', { status: response.status, detail });
        throw new Error(`WhatsApp API respondio ${response.status}`);
      }
    },
  };
}
