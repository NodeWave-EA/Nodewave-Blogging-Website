import { apiService } from '@/services/api'
import { buildStrapiQuery } from '@/services/queryBuilder'
import type { BlogPost } from '@/types'

/**
 * Produce Strapi query params to find related blog posts.
 * Criteria:
 *  - category matches any category on the current post
 *  - OR any tag on the current post intersects
 *  - exclude the current post id
 *  - limit results and sort by publishedAt desc by default
 */
export function buildRelatedPostsParams(
	current: BlogPost,
	limit = 4,
	sort = 'publishedAt:desc',
): Record<string, unknown> {
	const params: Record<string, unknown> = {
		'filters[id][$ne]': current.id,
		'pagination[pageSize]': limit,
		'populate[author][populate]': '*',
		'populate[categories]': '*',
		'populate[tags]': '*',
		'populate[featured_image]': '*',
		'sort[0]': sort,
		publicationState: 'live',
	}

	// Build an OR filter where any category id equals or any tag id equals
	let orIndex = 0

	if (current.categories && current.categories.length > 0) {
		current.categories.forEach((cat) => {
			params[`filters[$or][${orIndex}][categories][id][$eq]`] = cat.id
			orIndex += 1
		})
	}

	if (current.tags && current.tags.length > 0) {
		current.tags.forEach((tag) => {
			params[`filters[$or][${orIndex}][tags][id][$eq]`] = tag.id
			orIndex += 1
		})
	}

	// If no categories or tags were present, caller will receive newest posts excluding currentId
	return params
}

/**
 * Fetch related posts for the provided BlogPost using the above criteria.
 * Returns an array (possibly empty) of related BlogPost items.
 */
export async function fetchRelatedPosts(current: BlogPost, limit = 4) {
	const params = buildRelatedPostsParams(current, limit)
	const query = buildStrapiQuery(params)
	const resp = await apiService.get(`/blog-posts?${query}`) as any
	return resp?.data || []
}

/**
 * Utility predicate for determining whether a candidate post is related to the current one.
 * Useful for client-side filtering or tests.
 */
export function isRelated(candidate: BlogPost, current: BlogPost): boolean {
	if (!candidate || !current) return false

	// Check category intersection by id
	const curCatIds = new Set((current.categories || []).map((c) => c.id))
	if ((candidate.categories || []).some((c) => curCatIds.has(c.id))) return true

	// Check tag intersection by id
	const curTagIds = new Set((current.tags || []).map((t) => t.id))
	if ((candidate.tags || []).some((t) => curTagIds.has(t.id))) return true

	return false
}
