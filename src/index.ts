import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { createServer } from './server.js';
import { createWhatsAppClient } from './whatsapp/client.js';
import { createZohoClient } from './zoho/client.js';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);
const app = createServer({
  config,
  logger,
  whatsapp: createWhatsAppClient(config, logger),
  zoho: createZohoClient(config, logger),
});

app.listen(config.PORT, () => {
  logger.info('Cotizador de WhatsApp escuchando', { port: config.PORT });
});
