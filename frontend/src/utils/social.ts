import type { SocialLink } from "@/types"

export function getSocialUrl(socialLinks: SocialLink[] | Record<string, string>, platform: string): string | undefined {
	if (!socialLinks) return undefined
	if (Array.isArray(socialLinks)) {
		const found = socialLinks.find((s) => (s.platform || '').toLowerCase() === platform.toLowerCase())
		return found?.url
	}
	if (typeof socialLinks === 'object') return socialLinks[platform]
	return undefined
}
