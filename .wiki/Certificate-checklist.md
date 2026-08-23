# Certificate checklist

For a line such as `example.com *.example.com *.app.example.com`:

1. Register **`example.com`** in the UI **before** Apply. Nested wildcards on the same line reuse that account (parent-walk). No duplicate JSON rows needed.
2. At the real DNS for `example.com` (DNS only / grey cloud): one apex CNAME to the `fulldomain`; nested zones chain to that apex name — do not repeat the UUID.

```txt
_acme-challenge.example.com.       IN CNAME <uuid>.auth.example.org.
_acme-challenge.app.example.com.  IN CNAME _acme-challenge.example.com.
```

NXDOMAIN on a challenge name means that CNAME is missing or wrong.
3. At your registrar for the auth zone: NS/A glue for `auth.example.org` to the public IP, **grey cloud**. Must match `domain` / `records` in `config.cfg`.
4. Firewall/router: **UDP+TCP 53** to the host that actually runs `dns01-stack`.
5. `domains.txt` lists the names on one line (order does not matter). Edit in the Certs UI or on disk, **Save**, then **Apply** — no container restart. Production writes `live/`; Staging writes `staging/` only.
6. Grouped SANs on one acme-dns account need **100 TXT slots** (built into this stack). Do not re-register the apex to gain slots.
7. **`https://auth.acme-dns.io` still works**, but each public-service account only holds two TXT tokens (`example.com` + `*.example.com`). Nested names need another account and another CNAME, not a chain to the same UUID. This stack’s issuer skips those rows when `ACMEDNS_URL` is your own server.

Message `No acme-dns account for …` means the **container’s** `clientstorage.json` has no matching key or ancestor. Register the line apex.

From outside your LAN (cellular, not LAN DNS):

```bash
dig NS auth.example.org
dig A auth.example.org
dig TXT _acme-challenge.example.com
```

The last one should follow the CNAME into `….auth.example.org`.
