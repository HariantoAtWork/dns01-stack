import type { RegistrationVerifyResult } from '#shared/types/clientstorage'

export type RegistrationCheckStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'error'

export interface RegistrationCheckState {
  status: RegistrationCheckStatus
  message: string
  reason?: string
}

const idleState = (): RegistrationCheckState => ({
  status: 'idle',
  message: '',
})

/** Shared across DomainList instances (mobile drawer + desktop sidebar). */
const states = reactive<Record<string, RegistrationCheckState>>({})
const requestIds = new Map<string, number>()

export function useRegistrationCheck() {
  function stateFor(domain: string): RegistrationCheckState {
    return states[domain] ?? idleState()
  }

  function reset(domain?: string) {
    if (domain) {
      requestIds.set(domain, (requestIds.get(domain) ?? 0) + 1)
      states[domain] = idleState()
      return
    }
    for (const key of Object.keys(states)) {
      requestIds.set(key, (requestIds.get(key) ?? 0) + 1)
      delete states[key]
    }
  }

  async function check(domain: string, force = true) {
    if (!force) {
      const existing = states[domain]?.status
      if (existing === 'checking' || existing === 'valid' || existing === 'invalid' || existing === 'error') {
        return
      }
    }

    const id = (requestIds.get(domain) ?? 0) + 1
    requestIds.set(domain, id)
    states[domain] = {
      status: 'checking',
      message: 'Checking registration on the acme-dns server…',
    }

    try {
      const result = await $fetch<RegistrationVerifyResult>('/api/acmedns/verify', {
        method: 'POST',
        body: { domain },
      })

      if (requestIds.get(domain) !== id) {
        return
      }

      if (result.valid) {
        states[domain] = {
          status: 'valid',
          message: result.message,
          reason: result.reason,
        }
        return
      }

      states[domain] = {
        status: result.unreachable ? 'error' : 'invalid',
        message: result.message,
        reason: result.reason,
      }
    }
    catch (error) {
      if (requestIds.get(domain) !== id) {
        return
      }

      states[domain] = {
        status: 'error',
        message: error instanceof Error
          ? error.message
          : 'Failed to verify registration',
      }
    }
  }

  function checkAll(domains: string[]) {
    const active = new Set(domains)
    for (const key of Object.keys(states)) {
      if (!active.has(key)) {
        delete states[key]
        requestIds.delete(key)
      }
    }
    for (const domain of domains) {
      void check(domain, false)
    }
  }

  return {
    states,
    stateFor,
    check,
    checkAll,
    reset,
  }
}
