import type { Author } from './author'
import type { BlogPost } from './blogPost'
import type { Category } from './category'
import type { StrapiResponse } from './strapiResponse'
import type { Tag } from './tag'

export type ApiResponse<T> = StrapiResponse<T>
export type BlogPostResponse = StrapiResponse<BlogPost>
export type BlogPostsResponse = StrapiResponse<BlogPost[]>
export type AuthorResponse = StrapiResponse<Author>
export type AuthorsResponse = StrapiResponse<Author[]>
export type CategoryResponse = StrapiResponse<Category>
export type CategoriesResponse = StrapiResponse<Category[]>
export type TagResponse = StrapiResponse<Tag>
export type TagsResponse = StrapiResponse<Tag[]>
