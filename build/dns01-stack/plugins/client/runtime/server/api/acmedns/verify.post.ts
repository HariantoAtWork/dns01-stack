import type { RegistrationVerifyResult } from '#shared/types/clientstorage'

function messageFor(valid: boolean, reason?: string, unreachable?: boolean): string {
  if (valid) {
    return 'Registration is still valid on the acme-dns server.'
  }
  if (unreachable) {
    return reason
      ? `Could not reach the acme-dns server: ${reason}`
      : 'Could not reach the acme-dns server.'
  }
  switch (reason) {
    case 'account_not_found':
      return 'Account not found on the acme-dns server. Re-register after a reset.'
    case 'forbidden':
    case 'invalid_api_key':
      return 'Password no longer matches the acme-dns account.'
    case 'invalid_username':
      return 'Username is not accepted by the acme-dns server.'
    case 'subdomain_mismatch':
      return 'Stored subdomain does not match the acme-dns account.'
    case 'ip_not_allowed':
      return 'This host is not allowed to update the acme-dns account.'
    default:
      return reason
        ? `Registration check failed: ${reason}`
        : 'Registration is not valid on the acme-dns server.'
  }
}

export default defineEventHandler(async (event): Promise<RegistrationVerifyResult> => {
  const body = await readBody<{ domain?: string }>(event)
  const domain = body?.domain?.trim()
  if (!domain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'domain is required',
    })
  }

  const storage = await readStorage()
  const credentials = storage[domain]
  if (!credentials) {
    throw createError({
      statusCode: 404,
      statusMessage: `Domain not found in clientstorage: ${domain}`,
    })
  }

  const result = await verifyAcmeDnsAccount({
    serverUrl: credentials.server_url,
    username: credentials.username,
    password: credentials.password,
    subdomain: credentials.subdomain,
  })

  return {
    valid: result.valid,
    reason: result.reason,
    unreachable: result.unreachable,
    message: messageFor(result.valid, result.reason, result.unreachable),
  }
})
