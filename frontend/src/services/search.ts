import type { SearchResults } from '@/types'
import { apiService } from './api'

export const searchService = {
	// Full search endpoint for view-all / detailed search
	search: async (query: string, limit = 20) => {
		return apiService.get<SearchResults>('/search', {
			params: { q: query, limit },
		})
	},

	// Suggest endpoint for typeahead (lighter-weight)
	suggest: async (query: string, limit = 8) => {
		// Backend exposes `/search/suggestions` which returns `{ suggestions: Suggestion[] }`.
		return apiService.get<any>('/search/suggestions', {
			params: { q: query, limit },
		})
	},
}
