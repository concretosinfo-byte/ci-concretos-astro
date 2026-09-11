import { createAiAgent } from './ai/agent.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { createServer } from './server.js';
import { createWhatsAppClient } from './whatsapp/client.js';
import { createZohoClient } from './zoho/client.js';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);
const agent = config.OPENAI_API_KEY
  ? createAiAgent(
      {
        apiKey: config.OPENAI_API_KEY,
        baseUrl: config.OPENAI_BASE_URL,
        model: config.OPENAI_MODEL,
        currencySymbol: config.QUOTE_CURRENCY_SYMBOL,
        companyName: config.COMPANY_NAME,
      },
      logger,
    )
  : undefined;

if (!agent) {
  logger.warn('OPENAI_API_KEY no configurada: se usara el flujo guiado por menus');
}

const app = createServer({
  config,
  logger,
  whatsapp: createWhatsAppClient(config, logger),
  zoho: createZohoClient(config, logger),
  agent,
});

app.listen(config.PORT, () => {
  logger.info('Cotizador de WhatsApp escuchando', { port: config.PORT });
});
