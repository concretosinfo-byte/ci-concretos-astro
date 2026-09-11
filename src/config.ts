import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_GRAPH_VERSION: z.string().default('v21.0'),

  ZOHO_CLIENT_ID: z.string().min(1),
  ZOHO_CLIENT_SECRET: z.string().min(1),
  ZOHO_REFRESH_TOKEN: z.string().min(1),
  ZOHO_ORGANIZATION_ID: z.string().min(1),
  ZOHO_ACCOUNTS_DOMAIN: z.string().default('https://accounts.zoho.com'),
  ZOHO_API_DOMAIN: z.string().default('https://www.zohoapis.com'),

  QUOTE_CURRENCY_SYMBOL: z.string().default('$'),
  QUOTE_SESSION_TTL_MINUTES: z.coerce.number().default(60),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n  ');
    throw new Error(`Configuracion invalida:\n  ${details}`);
  }
  return parsed.data;
}
