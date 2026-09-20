# App CI Concretos (Android, iOS y PWA)

App móvil de CI CONCRETOS SAS construida con Expo (React Native + Expo Router). El mismo código
genera la app nativa de Android e iOS y la versión web instalable (PWA).

## Requisitos

- Node.js >= 20
- Cuenta de Expo y EAS CLI (`npm i -g eas-cli`) para generar los binarios de tienda

## Desarrollo

```bash
cd mobile
npm install
npm start        # Expo Dev Server (Android / iOS con Expo Go)
npm run web      # versión web en el navegador
npm run typecheck
```

## Estructura

- `app/` — rutas (Expo Router): Inicio, Servicios, Cotizar, Cobertura, Contacto
- `app/+html.tsx` — HTML raíz de la versión web (manifest, meta PWA, service worker)
- `components/`, `constants/`, `lib/` — UI compartida, contenido del sitio y acciones de contacto
- `public/` — `manifest.json`, `sw.js` e íconos de la PWA

## PWA

```bash
npm run build:web    # genera dist/ (renderizado estático)
npx serve dist
```

`dist/` se puede publicar en cualquier hosting estático (Vercel, Netlify, Cloudflare Pages) o en un
subdominio como `app.concretos-sas.com`. Al visitarla, el navegador ofrece "Instalar app" y el
service worker (`public/sw.js`) mantiene disponible el contenido ya visitado sin conexión.

## Builds nativos

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
npx eas submit --platform android
npx eas submit --platform ios
```

Requiere cuenta de Google Play Console (USD 25 pago único) y Apple Developer Program (USD 99/año).
El identificador de aplicación configurado es `com.ciconcretos.app`.
