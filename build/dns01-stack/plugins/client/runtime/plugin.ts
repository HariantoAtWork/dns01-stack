export default defineNuxtPlugin({
  name: 'dns01-client',
  enforce: 'pre',
  async setup(_nuxtApp) {
    // Runtime provide hooks for the operator UI live in composables.
    // This plugin marks the client package as loaded for diagnostics.
  },
  hooks: {
    'app:created'() {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.debug('[dns01-client] plugin ready')
      }
    },
  },
  env: {
    islands: true,
  },
})
