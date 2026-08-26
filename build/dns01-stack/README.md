# DNS01 Stack — acme-dns (Nuxt / Node) + operator UI

Single Nuxt 4 app that combines:

- **Host** — authoritative DNS on `:53`, SQLite, `POST /register`, `POST /update`, `GET /health`
- **Plugin** [`plugins/client`](./plugins/client) — operator UI, `/api/*`, clientstorage, certs, backups

Wire-compatible with the Go [acme-dns](https://github.com/acme-dns/acme-dns) data layout (100 TXT slots).

## Layout

```
plugins/client/
  index.ts                 # defineNuxtModule
  runtime/
    plugin.ts              # defineNuxtPlugin
    server/api|utils|…     # client APIs
    pages|components|…     # UI
server/                    # acme-dns DNS + HTTP only
```

Register locally with:

```ts
modules: ['./plugins/client']
```

## Local develop

```bash
bun install
DNS01_CONFIG=.data/server/config.cfg bun run dev
```

UI + API on `http://127.0.0.1:3000` in dev (`bun run dev`). DNS defaults via `seed/server/config.dev.cfg` → `.data/server/config.cfg` (listen `127.0.0.1:15353`).

From the repo root, the same stack runs in Docker with Compose profile `dev`:

```bash
bun run docker:dev
```

That bind-mounts this directory, runs `bun run dev`, and publishes `3000` + `15353`.

Production Docker reads `[api]` from `config.cfg`:

- Always HTTP on port `80` (`NITRO_PORT` / `PORT` override; with `tls = "none"`, `api.port` is the HTTP port — default `80`)
- `tls = "cert"` → also HTTPS on `api.port` (default `443`) using `tls_cert_fullchain` + `tls_cert_privkey`

```bash
curl -sS -X POST http://127.0.0.1:3000/register
curl -sS http://127.0.0.1:3000/health
dig @127.0.0.1 -p 15353 TXT <subdomain>.auth.example.test +short
```

Local ACME register/update from the UI plugin calls host utils **in-process** (no HTTP hop) when `ACMEDNS_URL` points at localhost / `dns01-stack`.

## Docker

Image always listens on **80** (HTTP). With `api.tls = "cert"` it also listens on **443** (HTTPS), plus **53** TCP/UDP (DNS). Mount:

- `/var/lib/dns01-stack/server` → `config.cfg` + SQLite
- `/var/lib/dns01-stack/client` → clientstorage, domains.txt, cert-settings, backups
- `/etc/letsencrypt` → PEMs

Local / `docker:dev` uses the same roles under project `.data/` (PEMs in `.data/letsencrypt`).
