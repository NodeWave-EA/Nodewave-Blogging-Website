// Debug utility for backend

/**
 * Controlled by process.env.DEBUG or process.env.VITE_DEBUG
 * Usage: import { dbg, moduleLoaded, isDebug } from '../utils/debug'
 */

export function isDebug(): boolean {
  try {
    const env = process && (process.env as Record<string, string | undefined>)
    return String(env.DEBUG || env.VITE_DEBUG || '').toLowerCase() === 'true'
  } catch (e) {
    console.error('Error checking debug environment variables', e)
    return false
  }
}

export function dbg(file: string, ...args: any[]) {
  if (!isDebug()) return
  console.log(`[${file}]`, ...args)
}

export function moduleLoaded(file: string) {
  dbg(file, 'loaded')
}
