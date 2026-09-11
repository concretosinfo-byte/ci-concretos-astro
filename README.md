# Cotizador de WhatsApp para CI Concretos

Servicio que recibe mensajes de WhatsApp (Cloud API de Meta), conduce una
conversacion para capturar los datos de la obra y crea la cotizacion
(Estimate) en Zoho Books.

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

Para probar en local expon el puerto con un tunel (ngrok, cloudflared) y
registra `https://<tunel>/webhook/whatsapp` como Callback URL en la app de
Meta, usando `WHATSAPP_VERIFY_TOKEN` como Verify Token.

## Flujo de la conversacion

1. Saludo y nombre del cliente o empresa
2. Seleccion de producto del catalogo (`src/quote/catalog.ts`)
3. Cantidad en m3 (valida el pedido minimo por producto)
4. Fecha de entrega (`DD/MM/AAAA`, `hoy`, `manana`)
5. Direccion de la obra
6. Resumen y confirmacion (`SI` / `NO`)
7. Creacion del contacto (si no existe) y de la cotizacion en Zoho Books,
   con el numero de cotizacion devuelto por WhatsApp

En cualquier momento el cliente puede escribir `cancelar` para reiniciar.

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
