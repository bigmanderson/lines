# Local run

Ports chosen to miss Hue (`6372` / `8098`), Harbour, Hearth, and Wedding Club Kit.

| Surface | Port |
| --- | --- |
| Vue (gold UI) | `5176` |
| Kit | `6376` |
| Cloud | `8104` |
| Embedded Postgres | `14124` |
| Broker | `15124` |
| Queue | `15224` |

Studio prefers one embedded Cloud at a time — stop Hue / Harbour / Hearth Cloud first if this boot fights them.

Start Cloud first:

```bash
cd cloud
cp cloud-config.example.json cloud-config.json   # first time only
inspatial cloud dev
```

Then the Vue app (recommended):

```bash
cd vue
npm install
npm run dev
```

Open http://127.0.0.1:5176

Or the Kit prototype:

```bash
cd kit
INSPATIAL_CLOUD_EMAIL=admin@user.com INSPATIAL_CLOUD_PASSWORD=password INSPATIAL_KIT_SYNC=0 inspatial run dev
```

Open http://127.0.0.1:6376

Cloud admin desk: `admin@user.com` / `password`.

First Cloud boot seeds Week 1 if needed, then pulls the live ESPN slate. A daily `scheduledTask` keeps doing that. Host can tap **Drop the lines** on a waiting match to reveal immediately for a local demo.

Optional: copy `cloud/.env.example` to `cloud/.env` and set `THE_ODDS_API_KEY` for a DraftKings overlay.

## Separate Vue deploy

Two InSpatial apps from this repo:

```bash
# Kit + Cloud
inspatial deploy --prod

# Vue gold (from vue/)
cd vue
VITE_CLOUD_URL=https://lines.inspatial.app npm run build
inspatial deploy --prod --skip-build --dist ./dist
```

- https://lines.inspatial.app — Kit + API
- https://lines-web.inspatial.app — Vue UI

`VITE_CLOUD_URL` is baked in at Vue build time. Leave it empty locally so Vite proxies `/api`.
