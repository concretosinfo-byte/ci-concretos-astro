# Cotizador de WhatsApp para CI Concretos

Servicio que recibe mensajes de WhatsApp (Cloud API de Meta), conversa con el
cliente mediante IA para capturar los datos de la obra y crea la cotizacion
(Estimate) **en borrador** en Zoho Books. Un asesor valida la cotizacion en
Zoho y, al aprobarla, un webhook la envia de vuelta al cliente por WhatsApp.

```
cliente -> WhatsApp -> IA conversacional -> borrador en Zoho Books
                                              |
                                     revision del asesor
                                              |
           cliente <- WhatsApp <- webhook /webhook/zoho/estimate-approved
```

## Requisitos

- Node.js 20 o superior
- Una app de Meta con WhatsApp Cloud API y un numero de WhatsApp Business
- Una organizacion de Zoho Books y un cliente OAuth (self client) con scope
  `ZohoBooks.estimates.CREATE`, `ZohoBooks.contacts.CREATE` y
  `ZohoBooks.contacts.READ`

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completa las credenciales
npm run dev
```

Endpoints:

- `GET /health` — verificacion de vida
- `GET /webhook/whatsapp` — handshake de verificacion de Meta
- `POST /webhook/whatsapp` — recepcion de mensajes (valida `X-Hub-Signature-256`)
- `POST /webhook/zoho/estimate-approved` — envia al cliente la cotizacion ya
  revisada (valida la cabecera `x-webhook-token` contra `ZOHO_WEBHOOK_TOKEN`)

Para probar en local expon el puerto con un tunel (ngrok, cloudflared) y
registra `https://<tunel>/webhook/whatsapp` como Callback URL en la app de
Meta, usando `WHATSAPP_VERIFY_TOKEN` como Verify Token.

## Conversacion con IA

Con `OPENAI_API_KEY` configurada, la conversacion la conduce un modelo
(`src/ai/agent.ts`) que responde en espanol, solo puede ofrecer productos del
catalogo y devuelve los campos extraidos en JSON. El servicio valida esos
campos antes de usarlos: el producto debe existir en el catalogo, la cantidad
debe cumplir el pedido minimo y la fecha debe ser valida.

Sin `OPENAI_API_KEY` (o si la llamada al modelo falla) se usa automaticamente
el flujo guiado por menus de `src/quote/flow.ts`, que pide en orden: nombre,
producto, cantidad, fecha, direccion y confirmacion. En cualquier momento el
cliente puede escribir `cancelar` para reiniciar.

## Revision antes de enviar

La cotizacion se crea en Zoho Books como borrador con
`reference_number = WA-<telefono>`; al cliente solo se le confirma el folio.
Cuando el asesor valida los datos en Zoho, Zoho Books dispara el webhook
`POST /webhook/zoho/estimate-approved` (Settings > Automation > Webhooks, con
la cabecera `x-webhook-token`). El servicio relee la cotizacion desde la API,
saca el telefono del `reference_number` y envia al cliente el folio, el total
y el enlace de la cotizacion.

El mismo endpoint sirve para disparar el envio manualmente:

```bash
curl -X POST https://<tu-host>/webhook/zoho/estimate-approved \
  -H 'Content-Type: application/json' \
  -H "x-webhook-token: $ZOHO_WEBHOOK_TOKEN" \
  -d '{"estimate_id":"1234567890"}'
```

## Precios y productos

El catalogo vive en `src/quote/catalog.ts`: SKU, nombre, descripcion, unidad,
precio unitario y pedido minimo. Al editar los precios ahi se actualizan tanto
el mensaje de WhatsApp como las lineas enviadas a Zoho Books.

## Credenciales de Zoho

El servicio usa un refresh token de larga duracion y renueva el access token
automaticamente (cacheado hasta un minuto antes de expirar). Ajusta
`ZOHO_ACCOUNTS_DOMAIN` y `ZOHO_API_DOMAIN` al centro de datos de tu cuenta.

## Comandos

```bash
npm test         # pruebas (vitest)
npm run lint     # eslint
npm run typecheck
npm run build    # compila a dist/
npm start        # ejecuta dist/src/index.js
```

## Estado de la conversacion

Las sesiones se guardan en memoria (`src/quote/store.ts`) con un TTL
configurable. Para varias instancias o reinicios sin perder conversaciones,
reemplaza `createMemoryStore` por una implementacion de `SessionStore` sobre
Redis o una base de datos.
