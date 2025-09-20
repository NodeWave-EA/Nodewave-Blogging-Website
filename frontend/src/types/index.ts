/**
 * TypeScript type definitions for the NodeWave Blog application
 */

// Loading State Type
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Image Interface
export interface StrapiImage {
  id: number
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: Record<string, unknown> | null
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// SEO Interface
export interface SEO {
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  metaRobots: string | null
  structuredData: Record<string, unknown> | null
  metaViewport: string | null
  canonicalURL: string | null
}

// Social Sharing Interface
export interface SocialSharing {
  socialImage: {
    data: StrapiImage | null
  } | null
}

// Base Author Interface
export interface Author {
  id: number
  documentId: string
  name: string
  slug: string
  email: string
  bio: string | null
  profile_picture?: {
    data: StrapiImage | null
  } | null
  social_links?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  } | null
  role?: string
  specialties?: string[]
  is_active?: boolean
  follower_count?: number
  post_count?: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
}

// Base Category Interface
export interface Category {
  id: number
  documentId: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon?: string
  post_count?: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
}

// Base Tag Interface
export interface Tag {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  post_count?: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
}

// Social Link Interface
export interface SocialLink {
  id: number
  platform: string
  url: string
  label?: string
}

// Company Info Interface
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

// Base BlogPost Interface
export interface BlogPost {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  locale: string | null
  featured_image?: {
    data: StrapiImage | null
  } | null
  author?: Author | null
  categories?: Category[] | null
  tags?: Tag[] | null
  seo?: SEO | null
  socialSharing?: SocialSharing | null
  status?: 'draft' | 'published' | 'archived'
  view_count?: number
  like_count?: number
  featured?: boolean
  reading_time?: number
  published_at_custom?: string
  priority?: 'low' | 'normal' | 'high'
  allow_comments?: boolean
}

// Strapi Response Wrapper
export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// Create/Update Interfaces (for forms)
export interface CreateAuthor {
  name: string
  slug: string
  email: string
  bio?: string
  avatar?: File | null
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
}

export interface UpdateAuthor extends Partial<CreateAuthor> {
  id: number
}

export interface CreateCategory {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface UpdateCategory extends Partial<CreateCategory> {
  id: number
}

export interface CreateTag {
  name: string
  slug: string
}

export interface UpdateTag extends Partial<CreateTag> {
  id: number
}

export interface CreateBlogPost {
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: File | null
  author: Author
  categories?: Category[]
  tags?: Tag[]
  seo?: SEO
  socialSharing?: SocialSharing
  status: 'draft' | 'published' | 'archived'
  featured?: boolean
}

export interface UpdateBlogPost extends Partial<CreateBlogPost> {
  id: number
}

// Filter and Query Interfaces
export interface BlogFilters {
  search?: string
  category?: string
  tag?: string
  author?: string
  status?: 'draft' | 'published'
  featured?: boolean
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  categories?: string[]
  tags?: string[]
  authors?: string[]
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sort?: string
  order?: 'asc' | 'desc'
}

export interface QueryParams extends BlogFilters, PaginationParams, SortParams {}

// Component Prop Types
export interface BlogCardProps {
  post: BlogPost
  showExcerpt?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadTime?: boolean
  showTags?: boolean
  variant?: 'default' | 'featured' | 'compact'
}

export interface AuthorCardProps {
  author: Author
  showBio?: boolean
  showSocialLinks?: boolean
  variant?: 'default' | 'compact'
}

export interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined'
}

export interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined'
}

// Navigation Types
export interface NavigationItem {
  name: string
  href: string
  current?: boolean
  children?: NavigationItem[]
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor?: string
  accentColor?: string
}

// API Error Types
export interface ApiError {
  status: number
  name: string
  message: string
  details?: Record<string, unknown>
}

// Pagination Meta
export interface PaginationMeta {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

// Site Configuration
export interface SiteConfig {
  name: string
  description: string
  url: string
  logo?: StrapiImage
  favicon?: StrapiImage
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    facebook?: string
    instagram?: string
  }
  analytics?: {
    googleAnalyticsId?: string
    facebookPixelId?: string
  }
  seo?: {
    defaultMetaTitle?: string
    defaultMetaDescription?: string
    defaultMetaImage?: StrapiImage
  }
}

// Newsletter Types
// Newsletter Types
export interface Newsletter {
  id: number
  email: string
  status: 'active' | 'pending' | 'unsubscribed'
  subscribed_at: string
  unsubscribed_at?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface NewsletterSubscription {
  id: number
  email: string
  status: 'active' | 'pending' | 'unsubscribed'
  subscribedAt: string
  unsubscribedAt?: string
  tags?: string[]
}

// Blog Settings Interface
export interface BlogSetting {
  id: number
  site_title: string
  site_description: string
  site_logo?: {
    data: StrapiImage | null
  } | null
  site_favicon?: {
    data: StrapiImage | null
  } | null
  contact_email: string
  social_links?: SocialLink[]
  seo_settings?: SEO
  createdAt: string
  updatedAt: string
}

// Page Interface
export interface Page {
  id: number
  documentId: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: {
    data: StrapiImage | null
  } | null
  seo?: SEO
  status: 'draft' | 'published'
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateNewsletterSubscription {
  email: string
  tags?: string[]
}

export interface NewsletterForm {
  email: string
  preferences?: {
    categories?: number[]
    frequency?: 'daily' | 'weekly' | 'monthly'
  }
}

// Comment Types (if implementing comments)
export interface Comment {
  id: number
  name: string
  email: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  likeCount?: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
  blogPost: {
    data: BlogPost
  }
  parent?: {
    data: Comment
  } | null
  replies?: {
    data: Comment[]
  }
  author?: {
    data: Author
  } | null
}

export interface CreateComment {
  name: string
  email: string
  content: string
  blogPostId: number
  parentId?: number
}

// Search Types
export interface SearchResult {
  type: 'post' | 'author' | 'category' | 'tag'
  id: number
  title: string
  slug: string
  excerpt?: string
  url: string
  relevanceScore?: number
}

export interface SearchResults {
  query: string
  results: SearchResult[]
  total: number
  took: number
}

export interface SearchFilters {
  query?: string
  category?: string
  tag?: string
  author?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'title'
}

// Analytics Types
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

// Form Types
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface CommentForm {
  name: string
  email: string
  content: string
  parentId?: number
}

// State Types (for Pinia stores)
export interface BlogState {
  posts: BlogPost[]
  currentPost: BlogPost | null
  categories: Category[]
  tags: Tag[]
  authors: Author[]
  loading: boolean
  error: string | null
  filters: BlogFilters
  pagination: PaginationMeta | null
}

export interface ThemeState {
  mode: ThemeMode
  config: ThemeConfig
}

export interface UIState {
  sidebarOpen: boolean
  modalOpen: boolean
  currentModal: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout?: number
  }>
}

// API Response Types (for better type safety)
export type ApiResponse<T> = StrapiResponse<T>
export type BlogPostResponse = StrapiResponse<BlogPost>
export type BlogPostsResponse = StrapiResponse<BlogPost[]>
export type AuthorResponse = StrapiResponse<Author>
export type AuthorsResponse = StrapiResponse<Author[]>
export type CategoryResponse = StrapiResponse<Category>
export type CategoriesResponse = StrapiResponse<Category[]>
export type TagResponse = StrapiResponse<Tag>
export type TagsResponse = StrapiResponse<Tag[]>
