import { closeAcmeDb, initAcmeDb } from '../utils/db'
import { loadAcmeConfig } from '../utils/config'
import { createDnsServer } from '../dns/server'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    const config = await loadAcmeConfig()
    await initAcmeDb(config)

    const dns = createDnsServer(config)
    await dns.start()
    console.info(`[dns01-stack] DNS ready on ${config.general.listen} zone=${config.general.domain}`)

    nitroApp.hooks.hook('close', async () => {
      await dns.close()
      closeAcmeDb()
    })
  }
  catch (error) {
    console.error('[dns01-stack] failed to start DNS/API backend', error)
    throw error
  }
})
