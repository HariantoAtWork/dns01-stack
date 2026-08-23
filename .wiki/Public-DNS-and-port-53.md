# Public DNS and port 53

acme-dns is a small **authoritative** DNS server for one zone (for example `auth.example.org`). Let's Encrypt follows a CNAME from your real domain into that zone, then queries **this** server for the TXT token.

## What must be on the public internet

1. At the real DNS for the certificate name (Cloudflare, registrar, …):  
   `CNAME _acme-challenge.example.com` → the `fulldomain` in `clientstorage.json`  
   (for example `87eb4f67-….auth.example.org`).  
   Nested names chain to that apex challenge (`_acme-challenge.app.example.com` → `_acme-challenge.example.com`).
2. Parent zone glue: NS/A so resolvers know where `auth.example.org` lives.
3. That A record (and `config.cfg` `records`) point at the public IP that answers **UDP/53 and TCP/53** with acme-dns.

NS records have **no port field**. Public DNS is always port 53. You cannot publish “DNS on 5353”. You can NAT `public:53` → `lan:53`; the internet still sees IP + 53.

You need **both** UDP and TCP 53. Compose maps both.

## What does not need to be public

| Piece | Public? |
| --- | --- |
| acme-dns DNS (`:53`) | Yes |
| acme-dns HTTP API (`:80` register/update) | No — loopback or cloudflared |
| Nuxt UI | No |
| ACME client | No — outbound only |

One acme-dns on one `:53` serves every registered hostname. You do not open a port per domain.

## Grey cloud

Keep the auth zone **DNS only** at Cloudflare (grey cloud). Orange-cloud proxies HTTP and breaks nameserver behaviour.
