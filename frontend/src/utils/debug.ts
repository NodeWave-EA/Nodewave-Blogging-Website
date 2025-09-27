// Debug utility for frontend

/**
 * Central debug utility. Controlled by environment variables:
 * - Vite frontend: VITE_DEBUG or DEBUG (string 'true')
 * - Usage: import { dbg, moduleLoaded, isDebug } from '@/utils/debug'
 * - Logs will be prefixed with [FileName]
 */

export function isDebug(): boolean {
	try {
		const env = (import.meta as any).env || {}
		return String(env.VITE_DEBUG || env.DEBUG || '').toLowerCase() === 'true'
	} catch (e) {
		return false
	}
}

export function dbg(file: string, ...args: any[]) {
	if (!isDebug()) return
	// Ensure the prefix includes the brackets exactly as requested by the user
	console.log(`[${file}]`, ...args)
}

export function moduleLoaded(file: string) {
	dbg(file, 'loaded')
}
