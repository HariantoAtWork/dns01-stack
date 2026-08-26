import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Package `seed/` tree (dev) or `/app/seed` (production image). */
export function resolveSeedPath(...parts: string[]) {
  const root = process.env.DNS01_SEED_ROOT
  const candidates = [
    root ? resolve(root, ...parts) : null,
    resolve(process.cwd(), 'seed', ...parts),
    resolve('/app/seed', ...parts),
  ].filter((value): value is string => Boolean(value))

  for (const path of candidates) {
    if (existsSync(path)) {
      return path
    }
  }
  return candidates[0] || resolve(process.cwd(), 'seed', ...parts)
}

export function readSeedFile(...parts: string[]) {
  const path = resolveSeedPath(...parts)
  if (!existsSync(path)) {
    return null
  }
  return readFileSync(path, 'utf8')
}
