import type { Author } from './author'
import type { BlogPost } from './blogPost'
import type { Category } from './category'
import type { Tag } from './tag'

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
