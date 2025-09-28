import Dexie from 'dexie'
import * as FlexSearchModule from 'flexsearch'
import { apiService } from './api'
import { blogPostsApi } from './posts'

// FlexSearch package may export differently depending on bundler/runtime.
const FlexSearch: any = (FlexSearchModule as any).default || FlexSearchModule

// Dexie DB
class SearchDB extends Dexie {
	posts!: Dexie.Table<any, number>
	authors!: Dexie.Table<any, number>
	categories!: Dexie.Table<any, number>
	tags!: Dexie.Table<any, number>
	indexStore!: Dexie.Table<{ key: string; data: any }, string>

	constructor() {
		super('nodewave_offline_search')
		this.version(1).stores({
			posts: 'id,slug,title',
			authors: 'id,slug,name',
			categories: 'id,slug,name',
			tags: 'id,slug,name',
			indexStore: '&key',
		})
	}
}

const db = new SearchDB()

// FlexSearch wrapper that hides API differences across builds
let flexWrapper: any = null

function createFlexWrapper() {
	// Allow forcing the simple fallback via env var for debugging or incompatible FlexSearch builds
	try {
		if ((import.meta as any).env?.VITE_FORCE_FLEX_FALLBACK === 'true') {
			console.warn('[offlineSearch] VITE_FORCE_FLEX_FALLBACK enabled — using substring fallback')
			const map = new Map<string, string>()
			return {
				type: 'fallback',
				instance: map,
				add: (doc: any) => map.set(doc.uid, `${doc.title || ''} ${doc.body || ''}`),
				search: async (q: string) => {
					const results: any[] = []
					const lower = q.toLowerCase()
					for (const [uid, txt] of map.entries()) {
						if (txt.toLowerCase().includes(lower)) results.push(uid)
					}
					return [{ result: results.map((uid) => ({ uid })) }]
				},
				export: async () => null,
				import: async () => null,
				_meta: { canExport: false, canImport: false },
			}
		}
	} catch (e) {
		// ignore env read errors
	}

	let canExport = false
	let canImport = false
	// Document-style API
	if (FlexSearch && typeof FlexSearch.Document === 'function') {
		const inst = new FlexSearch.Document({
			cache: true,
			document: { id: 'uid', index: ['title', 'body'], store: ['type', 'title', 'excerpt', 'slug'] },
		})
		// perform a non-invasive probe (synchronous) to detect presence of export/import methods
		const probe = probeExportImport(inst)
		canExport = probe.canExport
		canImport = probe.canImport
		// attach metadata to instance for later diagnostics
		try { (inst as any).__flex_probe = probe } catch (_) { }
		return {
			type: 'document',
			instance: inst,
			add: (doc: any) => inst.add(doc),
			search: async (q: string, opts: any) => inst.search(q, opts),
			export: async () => {
				try {
					if (typeof inst.export === 'function') {
						const out = inst.export()
						if (out && typeof out.then === 'function') return await out
						return out
					}
					if (typeof inst.serialize === 'function') {
						const out = inst.serialize()
						if (out && typeof out.then === 'function') return await out
						return out
					}
					return null
				} catch (e) {
					console.warn('FlexSearch export failed', e)
					return null
				}
			},
			import: async (data: any) => {
				try {
					if (typeof inst.import === 'function') {
						const r = inst.import(data)
						if (r && typeof r.then === 'function') return await r
						return r
					}
					if (typeof inst.load === 'function') {
						const r = inst.load(data)
						if (r && typeof r.then === 'function') return await r
						return r
					}
					return null
				} catch (e) {
					console.warn('FlexSearch import failed', e)
					return null
				}
			},
			_meta: { canExport: !!(canExport), canImport: !!(canImport) },
		}
	}

	// create() factory API
	if (FlexSearch && typeof FlexSearch.create === 'function') {
		try {
			const inst = FlexSearch.create({ document: { id: 'uid', index: ['title', 'body'] }, cache: true })
			// perform a synchronous non-invasive probe (no calling export/import)
			const probe = probeExportImport(inst)
			canExport = probe.canExport
			canImport = probe.canImport
			try { (inst as any).__flex_probe = probe } catch (_) { }
			return {
				type: 'document-factory',
				instance: inst,
				add: (doc: any) => inst.add(doc),
				search: async (q: string, opts: any) => inst.search(q, opts),
				export: async () => {
					if (!canExport) return null
					try { return inst.export && inst.export() } catch (e) { console.warn('FlexSearch export failed', e); return null }
				},
				import: async (data: any) => {
					if (!canImport) return null
					try { return inst.import && inst.import(data) } catch (e) { console.warn('FlexSearch import failed', e); return null }
				},
				_meta: { canExport, canImport },
			}
		} catch (e) {
			// fall through to index wrapper
		}
	}

	// Index-style API: create a single index combining title+body text
	if (FlexSearch && typeof FlexSearch.Index === 'function') {
		const idx = new FlexSearch.Index({ tokenize: 'forward', encode: 'icase' })
		return {
			type: 'index',
			instance: idx,
			add: (doc: any) => idx.add(doc.uid, `${doc.title || ''} ${doc.body || ''}`),
			search: async (q: string, opts: any) => {
				const r = idx.search(q, opts && opts.limit ? opts.limit : 100)
				// FlexSearch.Index returns array of ids
				return [{ result: r.map((id: any) => ({ uid: id })) }]
			},
			export: async () => {
				try {
					if (typeof idx.export === 'function') {
						const o = idx.export()
						if (o && typeof o.then === 'function') return await o
						return o
					}
					if (typeof idx.serialize === 'function') {
						const o = idx.serialize()
						if (o && typeof o.then === 'function') return await o
						return o
					}
					return null
				} catch (e) { console.warn('Index export failed', e); return null }
			},
			import: async (data: any) => {
				try {
					if (typeof idx.import === 'function') {
						const r = idx.import(data)
						if (r && typeof r.then === 'function') return await r
						return r
					}
					if (typeof idx.load === 'function') {
						const r = idx.load(data)
						if (r && typeof r.then === 'function') return await r
						return r
					}
					return null
				} catch (e) { console.warn('Index import failed', e); return null }
			},
			_meta: { canExport: false, canImport: false },
		}
	}

	// Final fallback: no FlexSearch available — simple in-memory substring search
	const map = new Map<string, string>()
	return {
		type: 'fallback',
		instance: map,
		add: (doc: any) => map.set(doc.uid, `${doc.title || ''} ${doc.body || ''}`),
		search: async (q: string) => {
			const results: any[] = []
			const lower = q.toLowerCase()
			for (const [uid, txt] of map.entries()) {
				if (txt.toLowerCase().includes(lower)) results.push(uid)
			}
			return [{ result: results.map((uid) => ({ uid })) }]
		},
		export: async () => null,
		import: async () => null,
		_meta: { canExport: false, canImport: false },
	}
}

// Create initial wrapper instance
flexWrapper = createFlexWrapper()

const DEFAULT_UPDATE_INTERVAL = 1000 * 60 * 30 // 30 minutes
let updateTimer: any = null
let networkAllowed = false

export const offlineSearch = {
	init: async (opts?: { updateIntervalMs?: number; allowNetwork?: boolean }) => {
		networkAllowed = !!opts?.allowNetwork
		// Attempt to load persisted index; if none, only rebuild from local DB unless allowNetwork is true
		await db.open()
		const loaded = await offlineSearch.loadPersistedIndex()
		if (!loaded) {
			if (opts?.allowNetwork) {
				await offlineSearch.updateContent()
			} else {
				// No persisted index and network not allowed — attempt to build index from existing local DB content
				await offlineSearch.buildIndex()
			}
		}
		// schedule periodic update only if network allowed
		const interval = opts?.updateIntervalMs ?? DEFAULT_UPDATE_INTERVAL
		updateTimer && clearInterval(updateTimer)
		if (opts?.allowNetwork) {
			updateTimer = setInterval(() => offlineSearch.updateContent(), interval)
		}
		// register service worker for caching (does not call API endpoints)
		offlineSearch.registerServiceWorker()
	},

	registerServiceWorker: async () => {
		if (!('serviceWorker' in navigator)) return

		// Attempt to fetch the SW script first to validate it isn't being served as HTML (SPA fallback)
		try {
			const resp = await fetch('/sw.js', { cache: 'reload' })
			const contentType = resp.headers.get('content-type') || ''
			if (!resp.ok) {
				console.warn('[offlineSearch] sw.js fetch failed with status', resp.status)
				return
			}
			if (!/javascript|application\/json|text\/javascript/.test(contentType)) {
				console.warn('[offlineSearch] SW registration skipped — sw.js served with unsupported MIME type', contentType)
				return
			}
			await navigator.serviceWorker.register('/sw.js')
			console.debug('[offlineSearch] Service worker registered')
		} catch (e) {
			console.warn('[offlineSearch] SW registration failed', e)
		}
	},

	fetchAllContent: async () => {
		if (!networkAllowed) {
			console.warn('[offlineSearch] fetchAllContent skipped because network is disabled')
			return
		}
		// Fetch all content pages for posts, authors, categories, tags
		// Posts: use paginated fetch to collect all pages
		const pageSize = 100
		let page = 1
		let allPosts: any[] = []
		while (true) {
			const resp = await blogPostsApi.getAll(page, pageSize, {})
			const data = resp?.data || []
			allPosts.push(...data)
			if (!data || data.length < pageSize) break
			page++
		}

		// Authors, categories, tags — request large page sizes
		const authorsResp: any = await apiService.get('/authors?pagination[pageSize]=1000')
		const categoriesResp: any = await apiService.get('/categories?pagination[pageSize]=1000')
		const tagsResp: any = await apiService.get('/tags?pagination[pageSize]=1000')

		const authors = authorsResp?.data || []
		const categories = categoriesResp?.data || []
		const tags = tagsResp?.data || []

		// store into IndexedDB
		await db.transaction('rw', db.posts, db.authors, db.categories, db.tags, async () => {
			await db.posts.bulkPut(allPosts.map((p) => ({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content })))
			await db.authors.bulkPut((authors as any[]).map((a: any) => ({ id: a.id, slug: a.slug, name: a.name, bio: a.bio })))
			await db.categories.bulkPut((categories as any[]).map((c: any) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description })))
			await db.tags.bulkPut((tags as any[]).map((t: any) => ({ id: t.id, slug: t.slug, name: t.name, description: t.description })))
		})
	},

	buildIndex: async () => {
		// Create a FlexSearch Document index and add all documents from Dexie
		flexWrapper = createFlexWrapper()
		// Load posts
		const posts = await db.posts.toArray()
		posts.forEach((p: any) => {
			flexWrapper.add({ uid: `post:${p.id}`, type: 'post', title: p.title, body: p.excerpt || p.content || '', excerpt: p.excerpt, slug: p.slug })
		})

		const authors = await db.authors.toArray()
		authors.forEach((a: any) => {
			flexWrapper.add({ uid: `author:${a.id}`, type: 'author', title: a.name, body: a.bio || '', slug: a.slug })
		})

		const categories = await db.categories.toArray()
		categories.forEach((c: any) => {
			flexWrapper.add({ uid: `category:${c.id}`, type: 'category', title: c.name, body: c.description || '', slug: c.slug })
		})

		const tags = await db.tags.toArray()
		tags.forEach((t: any) => {
			flexWrapper.add({ uid: `tag:${t.id}`, type: 'tag', title: t.name, body: t.description || '', slug: t.slug })
		})

		// persist index
		await offlineSearch.persistIndex()
	},

	persistIndex: async () => {
		if (!flexWrapper) return false
		try {
			console.debug('[offlineSearch] persistIndex - flexWrapper meta', flexWrapper?._meta)
			if (!flexWrapper._meta || !flexWrapper._meta.canExport) {
				console.warn('persistIndex: flexWrapper cannot export, skipping persist')
				return false
			}
			let exported: any = null
			try {
				exported = await flexWrapper.export()
				if (!exported) {
					console.warn('persistIndex: export returned falsy value')
					return false
				}
			} catch (e) {
				console.warn('persistIndex: export threw', e)
				return false
			}
			await db.indexStore.put({ key: 'flex-index-v1', data: exported })
			return true
		} catch (e) {
			console.warn('persistIndex failed', e)
			return false
		}
	},

	loadPersistedIndex: async () => {
		try {
			const entry = await db.indexStore.get('flex-index-v1')
			if (!entry || !entry.data) return false
			flexWrapper = createFlexWrapper()
			console.debug('[offlineSearch] loadPersistedIndex - flexWrapper meta', flexWrapper?._meta, { flexModule: typeof FlexSearchModule, FlexSearchType: typeof FlexSearch })
			if (!flexWrapper) return false
			const importFn = typeof flexWrapper.import === 'function' ? flexWrapper.import : null
			if (!importFn) {
				console.warn('loadPersistedIndex: flexWrapper has no import method')
				return false
			}
			await importFn.call(flexWrapper.instance, entry.data)
			return true
		} catch (e) {
			console.warn('loadPersistedIndex failed', e)
			return false
		}
	},

	updateContent: async () => {
		if (!networkAllowed) {
			console.warn('[offlineSearch] updateContent skipped because network is disabled')
			return
		}
		try {
			// fetch new content and update DB
			await offlineSearch.fetchAllContent()
			// rebuild index in background
			await offlineSearch.buildIndex()
			console.debug('[offlineSearch] content updated')
		} catch (e) {
			console.warn('[offlineSearch] updateContent failed', e)
		}
	},

	search: async (query: string, limit = 20) => {
		if (!query || query.trim().length < 2) return []
		if (!flexWrapper) {
			// attempt to load persisted index
			await offlineSearch.loadPersistedIndex()
			if (!flexWrapper) {
				// as fallback, build index from local DB
				await offlineSearch.buildIndex()
			}
		}

		const uidResults = await flexWrapper.search(query, { enrich: true, limit })
		// flexsearch Document enrich returns arrays keyed by field groups; flatten robustly
		const uids: string[] = collectUids(uidResults)

		// Look up documents in DB
		const docs = await Promise.all(uids.map(async (uid) => {
			const [type, idStr] = uid.split(':')
			const id = Number(idStr)
			switch (type) {
				case 'post': return db.posts.get(id)
				case 'author': return db.authors.get(id)
				case 'category': return db.categories.get(id)
				case 'tag': return db.tags.get(id)
				default: return null
			}
		}))

		return docs.filter(Boolean).slice(0, limit)
	},

	// Suggest using local index — return same shape as server: { suggestions: [...] }
	suggest: async (query: string, limit = 8) => {
		if (!query || query.trim().length < 2) return { suggestions: [] }
		if (!flexWrapper) await offlineSearch.loadPersistedIndex()
		if (!flexWrapper) return { suggestions: [] }
		const uidResults = await flexWrapper.search(query, { enrich: true, limit: Math.max(8, limit) })
		const uids: string[] = collectUids(uidResults)
		const unique = Array.from(new Set(uids)).slice(0, limit)
		const rows = await Promise.all(unique.map(async (uid) => {
			const [type, idStr] = uid.split(':')
			const id = Number(idStr)
			switch (type) {
				case 'post': return db.posts.get(id)
				case 'author': return db.authors.get(id)
				case 'category': return db.categories.get(id)
				case 'tag': return db.tags.get(id)
				default: return null
			}
		}))
		const suggestions = (rows.filter(Boolean) as any[]).map((r) => {
			if (r.title) return { text: r.title, type: 'post', slug: r.slug, url: `/blog/${r.slug}` }
			if (r.name) return { text: r.name, type: 'author', slug: r.slug, url: `/authors/${r.slug}` }
			return { text: r.name || r.title || '', type: 'unknown', slug: r.slug }
		})
		return { suggestions }
	},

	// Quick: return type-filtered local results shaped like server quick ( { data: [...] } )
	quick: async (query: string, type?: string, limit = 10) => {
		if (!query || query.trim().length < 2) return { data: [] }
		if (!flexWrapper) await offlineSearch.loadPersistedIndex()
		if (!flexWrapper) return { data: [] }
		const uidResults = await flexWrapper.search(query, { enrich: true, limit: Math.max(20, limit) })
		const uids: string[] = collectUids(uidResults)
		const unique = Array.from(new Set(uids))
		// filter by type prefix if provided, and hydrate docs
		const rows = (await Promise.all(unique.map(async (uid) => {
			const [t, idStr] = uid.split(':')
			const id = Number(idStr)
			switch (t) {
				case 'post': return db.posts.get(id)
				case 'author': return db.authors.get(id)
				case 'category': return db.categories.get(id)
				case 'tag': return db.tags.get(id)
				default: return null
			}
		}))).filter(Boolean) as any[]
		const filtered = type ? rows.filter((r) => {
			if (type === 'post') return !!r.title
			if (type === 'author') return !!r.name
			if (type === 'category') return !!r.name
			if (type === 'tag') return !!r.name
			return true
		}) : rows
		return { data: filtered.slice(0, limit) }
	},

	// Return popular categories from local DB — best-effort: return first N categories
	getPopularCategories: async (limit = 6) => {
		try {
			await db.open()
			const all = await db.categories.toArray()
			// If categories have a post_count property (from sync), sort by it, otherwise return first N
			const sorted = all.sort((a: any, b: any) => {
				if (typeof b.post_count === 'number' && typeof a.post_count === 'number') return b.post_count - a.post_count
				return (a.name || '').localeCompare(b.name || '')
			})
			return sorted.slice(0, limit)
		} catch (e) {
			console.warn('getPopularCategories failed', e)
			return []
		}
	},

	setNetworkAllowed: (flag: boolean) => {
		networkAllowed = !!flag
	},
}

// Helper: robustly flatten FlexSearch result shapes into an array of uid strings
function collectUids(uidResults: any): string[] {
	const uids: string[] = []
	if (!uidResults) return uids
	if (Array.isArray(uidResults)) {
		for (const g of uidResults) {
			if (g == null) continue
			// primitive id or uid
			if (typeof g === 'string' || typeof g === 'number') {
				uids.push(String(g))
				continue
			}

			// array of ids or objects
			if (Array.isArray(g)) {
				for (const item of g) {
					if (item == null) continue
					if (typeof item === 'string' || typeof item === 'number') uids.push(String(item))
					else if (item.uid) uids.push(item.uid)
					else if (item.id) uids.push(String(item.id))
				}
				continue
			}

			// object with a 'result' property (Document-style)
			if (g && typeof g === 'object' && g.result !== undefined) {
				const res = g.result
				if (Array.isArray(res)) {
					for (const r of res) {
						if (r == null) continue
						if (typeof r === 'string' || typeof r === 'number') uids.push(String(r))
						else if (r.uid) uids.push(r.uid)
						else if (r.id) uids.push(String(r.id))
					}
				} else if (res && typeof res === 'object') {
					for (const val of Object.values(res)) {
						if (val == null) continue
						if (Array.isArray(val)) {
							for (const r of val) {
								if (r == null) continue
								if (typeof r === 'string' || typeof r === 'number') uids.push(String(r))
								else if (r.uid) uids.push(r.uid)
								else if (r.id) uids.push(String(r.id))
							}
						} else if (typeof val === 'string' || typeof val === 'number') {
							uids.push(String(val))
						} else if (val && (val as any).uid || (val as any).id) {
							uids.push((val as any).uid || String((val as any).id))
						} else {
							// unexpected shape — try JSON stringify for diagnostics
							console.debug('[offlineSearch] collectUids encountered unexpected value', val)
						}
					}
				}
				continue
			}

			// object with top-level uid/id
			if (g && typeof g === 'object') {
				if ((g as any).uid) uids.push((g as any).uid)
				else if ((g as any).id) uids.push(String((g as any).id))
				else console.debug('[offlineSearch] collectUids unrecognized object entry', g)
				continue
			}
		}
	} else if (typeof uidResults === 'object') {
		// sometimes FlexSearch may return an object map — try to extract values
		for (const v of Object.values(uidResults)) {
			if (typeof v === 'string' || typeof v === 'number') uids.push(String(v))
			else if (Array.isArray(v)) v.forEach((it) => typeof it === 'string' || typeof it === 'number' ? uids.push(String(it)) : it && it.uid && uids.push(it.uid))
		}
	}
	return uids
}

function probeExportImport(inst: any): { canExport: boolean; canImport: boolean } {
	// Do a non-invasive probe: only detect presence of methods, do not call them.
	// Calling inst.export() in some FlexSearch builds can throw due to internal assumptions,
	// so we avoid invoking export/import here to prevent runtime errors.
	const canExport = !!(inst && (typeof inst.export === 'function' || typeof inst.serialize === 'function'))
	const canImport = !!(inst && (typeof inst.import === 'function' || typeof inst.load === 'function'))
	try { (inst as any).__flex_probe = { canExport, canImport } } catch (_) { }
	return { canExport, canImport }
}

export default offlineSearch
