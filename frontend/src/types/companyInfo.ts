import type { SEO } from './seo'
import type { SocialLink } from './socialLink'
import type { StrapiImage } from './strapiImage'

export interface CompanyInfo {
	id: number
	site_title: string
	site_description: string
	company_name: string
	logo: {
		data: StrapiImage | null
	} | null
	logo_dark: {
		data: StrapiImage | null
	} | null
	favicon: {
		data: StrapiImage | null
	} | null
	contact_email: string
	contact_phone?: string
	address?: string
	website_url: string
	social_links: SocialLink[]
	about_company?: string
	mission_statement?: string
	vision_statement?: string
	founded_year?: number
	team_size?: number
	newsletter_enabled: boolean
	comments_enabled: boolean
	google_analytics_id?: string
	meta_keywords?: string
	og_image: {
		data: StrapiImage | null
	} | null
	seo?: SEO
	createdAt: string
	updatedAt: string
}
