# Modelo de seguridad — CI Concretos (ci-concretos-astro)

> Modelo de amenazas que usan los escaneos de seguridad de Devin para priorizar hallazgos. Las líneas marcadas *(usuario)* son decisiones confirmadas por el equipo; el resto describe el código tal como está. Mantenlo al día cuando cambien los webhooks, las integraciones o lo que se considera riesgo aceptado. El modelo equivalente de Aura Studio vive en `concretosinfo-byte/aura-studio/SECURITY_MODEL.md`.

## 1. Visión general y fronteras de confianza
Servicio Node.js/Express (`src/server.ts`, arranque en `src/index.ts`) que cotiza concreto premezclado por WhatsApp. Un cliente anónimo de WhatsApp conversa con un agente OpenAI (`src/ai/agent.ts`) o con el flujo de menús (`src/quote/flow.ts`); al confirmar, se crea un **borrador** de Estimate en Zoho Books (`src/zoho/client.ts`, `src/zoho/estimate.ts`, `reference_number = WA-<teléfono>`). Un asesor lo revisa en Zoho y el webhook de aprobación lo envía al cliente por WhatsApp.

Fronteras:
- Internet/Meta → webhooks.
- Texto del cliente → LLM (no confiable) → campos validados contra el catálogo (`src/quote/aiFlow.ts`, `src/quote/catalog.ts`).
- Servicio → APIs de Meta, Zoho y OpenAI con secretos del servidor (`src/config.ts`).
- Estado de sesión en memoria (`src/quote/store.ts`, TTL 60 min) y deduplicación de mensajes en el `Set` `processedMessages` de `src/server.ts`.

## 2. Componentes
| Componente | Código |
|---|---|
| **Webhooks CI** | `src/server.ts`, `src/whatsapp/signature.ts`, `src/whatsapp/types.ts` |
| **Agente IA y flujo de cotización** | `src/ai/`, `src/quote/` |
| **Integraciones CI (Zoho/WhatsApp)** | `src/zoho/`, `src/whatsapp/client.ts`, `src/config.ts`, `src/logger.ts` |

## 3. Puntos de entrada y quién los alcanza
- `POST /webhook/whatsapp` — cualquiera en Internet; autenticado con HMAC SHA-256 `X-Hub-Signature-256` (`isValidSignature`, comparación con `timingSafeEqual`). El contenido del mensaje lo controla cualquier usuario de WhatsApp.
- `GET /webhook/whatsapp` — handshake de Meta con `WHATSAPP_VERIFY_TOKEN`.
- `POST /webhook/zoho/estimate-approved` — cualquiera en Internet; token compartido `x-webhook-token` (`ZOHO_WEBHOOK_TOKEN`). Envía por WhatsApp el estimate al teléfono sacado de `reference_number`.
- `GET /health`.

## 4. Activos y sensibilidad
- Secretos: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, credenciales OAuth de Zoho (`ZOHO_REFRESH_TOKEN`, …), `ZOHO_WEBHOOK_TOKEN`, `OPENAI_API_KEY`. Alto.
- Datos de clientes: teléfono, nombre, dirección de obra, cotizaciones y precios en Zoho Books. Medio-alto.
- Integridad de las cotizaciones y del canal WhatsApp de la empresa (suplantación, spam a clientes). Alto.

## 5. Perfiles de atacante
- Atacante anónimo en Internet contra los webhooks.
- Cliente de WhatsApp malicioso: inyección de prompts al agente, manipulación de cantidad/producto/fecha, spam que agote memoria o costo de OpenAI.
- Atacante que obtenga secretos de `.env` o de los logs.

## 6. Controles existentes
- Firma HMAC de Meta en tiempo constante y token compartido de Zoho.
- Validación Zod de la configuración (`src/config.ts`), de los payloads del webhook (`src/whatsapp/types.ts`) y de la respuesta del LLM (`src/ai/agent.ts`).
- Producto, cantidad y fecha extraídos por el LLM se validan contra el catálogo antes de cotizar.
- Las cotizaciones se crean como borrador y un asesor las revisa antes de que lleguen al cliente.

## 7. Prioridades, fuera de alcance y riesgo aceptado *(usuario)*
- **Activos prioritarios** *(usuario)*: todos por igual — credenciales de Zoho/WhatsApp/OpenAI y datos de clientes de CI Concretos.
- **Atacantes relevantes** *(usuario)*: todos los de la sección 5, incluidos los clientes de WhatsApp maliciosos (inyección de prompts).
- **Fuera de alcance / riesgo aceptado** *(usuario)*: nada específico de este repositorio.

## 8. Preguntas abiertas
- Existe un repositorio de infraestructura que todavía no está conectado a los escaneos; no se sabe dónde ni cómo se despliega este servicio (HTTPS, red, gestión de secretos).
