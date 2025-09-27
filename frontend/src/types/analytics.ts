import type { Author } from './author'
import type { BlogPost } from './blogPost'
import type { Category } from './category'

export interface AnalyticsData {
	pageviews: {
		total: number
		today: number
		thisWeek: number
		thisMonth: number
	}
	topPosts: Array<{
		post: BlogPost
		views: number
	}>
	topCategories: Array<{
		category: Category
		postCount: number
	}>
	recentPosts: BlogPost[]
	popularAuthors: Array<{
		author: Author
		postCount: number
		totalViews: number
	}>
}
