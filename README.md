# TRAC BYPASS

*Beyond the Ordinary.* A Next.js app that sends a link to Bacon API (`POST https://baconbypass.online/bypass`) through its own backend and shows the result.

## Stack / dependencies
next 15 (App Router), react 19, typescript, tailwindcss 3, motion (Motion for React), lucide-react, zod 3, server-only. GSAP is not used: nothing here needs it.

## Install and run locally
```bash
npm install
cp .env.example .env.local      # then edit it
npm run dev                     # http://localhost:3000
npm run typecheck
npm run build && npm start      # production check
```

## Environment variables (server-side only, never `NEXT_PUBLIC_`)
| Variable | Purpose |
|---|---|
| `TRAC_AUTH_MODE` | `admin` (server key) or `user` (visitor's own key). Empty = "not configured". |
| `BACON_API_KEY` | Needed only for `admin`. Use admin mode on a public site only if Bacon API's terms allow one key to serve other users. |
| `TRAC_ALLOWED_ORIGINS` | Optional comma-separated Origin allow-list for `/api/bypass`. |
| `TRAC_TIMEOUT_MS` | Optional upstream timeout (default 55000, max 58000). |

## Deploy to Vercel
1. Push the project to Git and import it in Vercel (framework: Next.js, no build overrides).
2. Add the environment variables above (Settings > Environment Variables), then redeploy.
3. `maxDuration = 60` in `src/app/api/bypass/route.ts` is the function limit. Bacon API can take up to 90 s, so very slow links will time out at about 55 s. Raise `maxDuration` and `TRAC_TIMEOUT_MS` only if your Vercel plan allows longer functions.

## Bacon API integration
`src/lib/bacon.ts` posts `{ url, apikey }` as JSON. It maps 200/400/403/429/5xx to the app's error codes, treats a 200 as success only when `status === "success"` (or `success === true`) and `result` is an http(s) URL, and turns anything else into "unexpected response". Upstream error text is never forwarded. Timeouts abort the request; there is no automatic retry.

## Working features
Link validation (browser + server, standard URL parser), SSRF pre-filter (non-http(s), credentials in URL, localhost, private/loopback/link-local/metadata IPs, internal-style hostnames, DNS resolution check), rate limit (8/min and 1 in-flight per IP), body limit, content-type check, optional Origin allow-list, security headers, minimal logs without secrets, paste/copy/open/clear, indeterminate progress with real elapsed time, local history (opt-in, localStorage), API status, FAQ, Privacy and Terms pages, reduced-motion support.

## Needs configuration or has limits
- Nothing works until `TRAC_AUTH_MODE` is set (and `BACON_API_KEY` for admin mode).
- The rate limiter is in memory, so on serverless each instance counts separately. Use a shared store such as Upstash Redis for strict limits.
- Bacon API, not this server, opens the target link, so redirects and DNS rebinding on their side can't be controlled here. The SSRF check is a pre-filter, not a guarantee.
- "Upstream API" status shows only what real requests returned. No health endpoint or quota endpoint is documented, so none is called.
- Not tested against the live Bacon API (no key or network access when this was written).

## Basic testing
1. `npm run typecheck && npm run build`.
2. With no env set, the panel shows "The processing service is not configured yet."
3. Set `TRAC_AUTH_MODE=user`, enter `http://localhost`, `http://192.168.1.1`, `ftp://x.com`, `https://user:pw@example.com`: each must show the invalid URL message (browser accepts some, server must reject).
4. With a valid key and public link: the result appears only after the API responds; Copy shows the toast; Open uses a new tab.
5. Send 9 requests within a minute: the 9th returns the rate-limit message.
6. Search the built output (`.next/static`) for your key: it must not appear.
