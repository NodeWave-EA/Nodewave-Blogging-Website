import DOMPurify from 'dompurify';

function escapeRegex(s: string) {
	return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// Highlight query tokens in text; fallback to fuzzy character matching when no token matches
export function highlightText(text: string, query: string): string {
	if (!text || !query) return DOMPurify.sanitize(text)

	const original = String(text)
	const q = query.trim()
	if (!q) return DOMPurify.sanitize(original)

	const tokens = q.split(/\s+/).filter(Boolean)

	// Try token-based highlighting first
	const tokenRegex = new RegExp(tokens.map(escapeRegex).join('|'), 'ig')
	if (tokenRegex.test(original)) {
		const replaced = original.replace(tokenRegex, (m) => `<mark class="bg-yellow-200 dark:bg-yellow-600 rounded">${m}</mark>`)
		return DOMPurify.sanitize(replaced, { ALLOWED_TAGS: ['mark', 'b', 'i', 'strong', 'em', 'u', 'br', 'p', 'div', 'span'], ALLOWED_ATTR: ['class'] })
	}

	// Fuzzy fallback: highlight characters in sequence (first-match order)
	const chars = q.replace(/\s+/g, '').toLowerCase().split('')
	if (chars.length === 0) return DOMPurify.sanitize(original)

	let result = ''
	let ci = 0
	for (let i = 0; i < original.length; i++) {
		const ch = original[i]
		if (ci < chars.length && ch.toLowerCase() === chars[ci]) {
			result += `<mark class="bg-yellow-200 dark:bg-yellow-600 rounded">${ch}</mark>`
			ci++
		} else {
			result += ch
		}
	}

	return DOMPurify.sanitize(result, { ALLOWED_TAGS: ['mark', 'b', 'i', 'strong', 'em', 'u', 'br', 'p', 'div', 'span'], ALLOWED_ATTR: ['class'] })
}
