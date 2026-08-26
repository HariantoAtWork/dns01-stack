# Install and Nuxt build run on the host CPU. QEMU amd64 on Apple Silicon
# crashes Bun (SIGILL). The Nitro output is JS; only the runner is per-arch.
FROM node:24-alpine AS bun-base
RUN apk add --no-cache bash curl unzip \
  && curl -fsSL https://bun.com/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

FROM bun-base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run build

FROM node:24-alpine AS runner
COPY --from=build /root/.bun /root/.bun
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV DNS01_CONFIG=/var/lib/dns01-stack/server/config.cfg
ENV DNS01_CLIENTSTORAGE=/var/lib/dns01-stack/client/clientstorage.json
ENV DNS01_CLIENT_ROOT=/var/lib/dns01-stack/client
ENV DNS01_DOMAINS=/var/lib/dns01-stack/client/domains.txt
ENV DNS01_CERT_SETTINGS=/var/lib/dns01-stack/client/cert-settings.json
ENV DNS01_LETSENCRYPT=/etc/letsencrypt
COPY --from=build /app/.output .output
COPY --from=build /app/seed/config.cfg /app/config.cfg.default
EXPOSE 53 80 443
EXPOSE 53/udp
CMD ["/bin/sh", "-c", "set -e; file=\"${DNS01_CLIENTSTORAGE:?DNS01_CLIENTSTORAGE is required}\"; mkdir -p \"$(dirname \"$file\")\" /var/lib/dns01-stack/server /var/lib/dns01-stack/client /etc/letsencrypt; if [ ! -s \"$file\" ]; then echo '{}' > \"$file\"; fi; exec bun .output/server/index.mjs"]
