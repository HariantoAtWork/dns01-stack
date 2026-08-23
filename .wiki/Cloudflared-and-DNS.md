# Cloudflared and DNS

Cloudflared looks like it splits traffic by hostname. It does, but only for **HTTP(S)**, and not through your public IP.

## What the tunnel does

1. `cloudflared` on the LAN opens an **outbound** connection to Cloudflare (usually 443).
2. Inbound NAT / DMZ is irrelevant for that path.
3. A client hits `https://auth.example.org` (or whichever hostname you mapped).
4. Cloudflare’s edge already has the hostname (TLS SNI / HTTP `Host`).
5. Cloudflare sends the request down that tunnel to the container in `docker-compose.override.yml` (from the `.example`; `dns01-stack:80`, …).

Hostname routing lives at **Cloudflare**, not on your public IP. Many names, one tunnel.

## What it cannot do

Let's Encrypt DNS-01 is **UDP/TCP 53**. Validators follow NS/A glue and talk to your public IP on port 53. They will not send that query down a Cloudflare Tunnel.

A grey-cloud A `auth.example.org → your.public.ip` is the opposite of a tunnel: “send DNS to this IP”. Orange-cloud on that name would proxy HTTP and break it as a nameserver.

## In this compose

The external `cloudflared` network is attached to `dns01-stack` so the **UI and HTTP API** can have hostnames. Port 53 stays on the host.

The in-process `/update` hook can succeed even when public 53 is wrong. The **outside** TXT check still fails.
