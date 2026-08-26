import tailwindcss from '@tailwindcss/vite'

// `nuxt dev` runs Nitro under Node — do not use the Bun.serve entry there.
const isNuxtDev = process.argv.includes('dev')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/fonts',
    './plugins/client',
  ],
  nitro: {
    preset: 'bun',
    // Production / `nuxt build` only — Bun.serve + TLS from config.cfg
    ...(isNuxtDev ? {} : { entry: './entry.ts' }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: {
    families: [
      { name: 'Outfit', provider: 'bunny', weights: [400, 500, 600, 700] },
      { name: 'IBM Plex Mono', provider: 'bunny', weights: [400, 500] },
    ],
  },
  runtimeConfig: {
    /** Live config path (overridden in Docker via DNS01_CONFIG). */
    acmeDnsConfig: '.data/server/config.cfg',
    /** First-boot template: dev listen/ports locally; production seed in Docker builds. */
    acmeDnsDefaultConfig: isNuxtDev
      ? 'seed/server/config.dev.cfg'
      : 'seed/server/config.cfg',
    clientstorageData: '.data/client/clientstorage.json',
    applicationsDataRoot: '.data/client',
    acmednsUrl: 'http://127.0.0.1',
    administratorPassword: '',
    domainsFile: '.data/client/domains.txt',
    certbotConfigDir: '.data/letsencrypt',
    certSettingsFile: '.data/client/cert-settings.json',
    letsencryptEmail: 'admin@example.com',
    renewInterval: 12,
    certsAcmeEnabled: true,
    public: {
      defaultAcmednsUrl: 'http://127.0.0.1',
      restrictMode: false,
    },
  },
  dns01Client: {
    acmednsUrl: 'http://127.0.0.1',
    defaultAcmednsUrl: 'http://127.0.0.1',
  },
  app: {
    head: {
      title: 'DNS01 Stack',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content: 'DNS01 Stack — acme-dns nameserver plus operator UI, clientstorage, and Let\'s Encrypt issuance.',
        },
      ],
    },
  },
})
