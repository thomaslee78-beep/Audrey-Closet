# Audrey Smart Scan Cloudflare Worker — Phase 7A4

This folder contains the production Smart Scan service for Audrey Closet.

The public PWA calls this Worker. The Worker holds `OPENAI_API_KEY` as a Cloudflare secret and forwards only approved Smart Scan requests to OpenAI.

## Recommended first deployment: Cloudflare dashboard + GitHub

1. Create/sign in to a Cloudflare account.
2. Open **Workers & Pages** and create/import a Worker from GitHub.
3. Connect repository: `thomaslee78-beep/Audrey-Closet`.
4. Use branch: `dev/smart-scan-color-pattern-v13.24` for Preview testing.
5. Set the project root / working directory to `server`.
6. Deploy command: `npm run deploy` (or `npx wrangler deploy`).
7. Worker name: `audrey-smartscan-api`.
8. Before the final deployment succeeds, add the required secret:
   - Worker → **Settings** → **Variables and Secrets** → **Add**
   - Type: **Secret**
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
   - Save / Deploy
9. Optional plain variable:
   - `SMARTSCAN_DAILY_LIMIT=30`
   - This already defaults to 30 in `wrangler.jsonc`.
10. After deployment, Cloudflare will give you a URL similar to:
    `https://audrey-smartscan-api.<your-subdomain>.workers.dev`
11. Test health in a browser:
    `<worker-url>/health`
    Expected JSON includes `ok: true` and `service: "audrey-smartscan"`.
12. Send only the Worker URL back to the development thread. Do **not** send the API key.

## Secret safety

Never put `OPENAI_API_KEY` in:

- GitHub source files
- GitHub Actions YAML
- browser JavaScript
- localStorage
- Preview configuration
- chat messages

The Worker accesses it through `env.OPENAI_API_KEY`.

## Optional quota storage (recommended before broad public release)

The Worker can use a Cloudflare KV binding named `SMARTSCAN_USAGE_KV` to enforce daily per-install/network quotas.

Without KV, Smart Scan still works, but quota mode is `log-only`.

When ready:

1. Cloudflare dashboard → **Storage & Databases** → **KV** → create namespace, for example `audrey-smartscan-usage`.
2. Worker → **Settings** → **Bindings** → Add KV namespace binding.
3. Binding name must be exactly: `SMARTSCAN_USAGE_KV`.
4. Select the namespace you created.
5. Redeploy the Worker.

## Current endpoints

- `GET /health`
- `POST /v1/smartscan/analyze`

The analyze endpoint:

- allows only Audrey Closet origins
- validates app/feature headers
- validates image/request size
- restricts AI models to the Audrey allowlist
- validates the returned clothing taxonomy
- logs model/token/request usage server-side
- optionally enforces daily quotas using KV

## Local CLI alternative

From the repository:

```bash
cd server
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

Enter the key only into Wrangler's secret prompt.

## Preview integration

The PWA modules are already prepared for service mode:

- `smart-scan-service-v13.24-phase7a4a.js`
- `smart-scan-ai-v13.24-phase7a4-runtime.js`

Preview currently leaves service mode dormant. Once the Worker URL is known, the Preview deployment can inject:

```js
window.AUDREY_SMART_SCAN_SERVICE_CONFIG = {
  enabled: true,
  endpoint: 'https://YOUR-WORKER.workers.dev',
  defaultModel: 'gpt-5.6-luna',
  detail: 'auto'
};
```

No API key is present in this configuration.

## Future Audrey Cloud expansion

This Worker can remain the Smart Scan route while the backend grows into a broader Audrey Cloud API. Future components can be separated by route/service, for example:

- `/v1/smartscan/*`
- `/v1/auth/*`
- `/v1/sync/*`
- `/v1/backup/*`
- `/v1/admin/*`

Cloudflare D1 can later hold relational app/sync metadata, while R2 can hold backup photos and larger objects. Keep Smart Scan provider logic isolated even if these services share the same Cloudflare account/platform.
