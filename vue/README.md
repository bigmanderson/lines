# LINES web (Vue)

The gold play surface. Same InSpatial Cloud as the Kit prototype. Separate deploy URL.

## Local

Cloud must already be on **8104**.

```bash
cd vue
npm install
npm run dev
```

Open http://127.0.0.1:5176

Vite proxies `/api` to Cloud.

## Live

https://lines-web.inspatial.app

Built against `VITE_CLOUD_URL=https://lines.inspatial.app` so the Vue app uses the Kit+Cloud backend.

```bash
VITE_CLOUD_URL=https://lines.inspatial.app npm run build
inspatial deploy --prod --skip-build --dist ./dist
```
