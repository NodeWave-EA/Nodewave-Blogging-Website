import type { ApiResponse, Comment, CommentForm } from '@/types'
import { moduleLoaded } from '@/utils/debug'
import { apiService } from './api'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('comments.ts')

/**
 * Client wrapper for comment-related API operations.
 *
 * Provides helper methods to fetch comments for a specific blog post
 * and to create new comments. The implementations build Strapi-compatible
 * query parameters and delegate HTTP requests to the shared apiService.
 *
 * getByPostId
 * - Fetches comments associated with a given blog post id.
 * - Applies server-side filters so only approved comments for the specified post are returned.
 * - Populates the parent comment relation and sorts results by creation time (ascending).
 * - Requests live/publication state data.
 *
 * @param postId - Numeric identifier of the blog post whose comments should be fetched.
 * @returns A promise that resolves to an ApiResponse containing an array of Comment objects.
 * @throws Errors produced by the underlying HTTP service (e.g., network errors, non-2xx responses).
 *
 * create
 * - Submits a new comment to the backend.
 * - Sends the provided CommentForm payload as the request body to create the comment resource.
 *
 * @param data - The comment form payload used to create a new comment (author, content, optional parent/post links etc.).
 * @returns A promise that resolves to an object containing the created Comment under the `data` key.
 * @throws Errors produced by the underlying HTTP service (validation failures, network errors, non-2xx responses).
 *
 * @remarks
 * - This API client expects the presence of shared utilities: buildStrapiQuery for query string creation
 *   and apiService for performing HTTP requests.
 * - Callers should handle promise rejections and interpret API error shapes as returned by the backend.
 *
 * @example
 * // Fetch comments for post #42
 * // const response = await commentsApi.getByPostId(42);
 *
 * @example
 * // Create a new comment
 * // const created = await commentsApi.create({ name: 'Alice', content: 'Great post!', blog_post: 42 });
 */
export const commentsApi = {
  getByPostId: async (postId: number): Promise<ApiResponse<Comment[]>> => {
    const params = {
      'filters[blog_post][id][$eq]': postId,
      'filters[approved][$eq]': true,
      'populate[parent_comment]': '*',
      'sort[0]': 'createdAt:asc',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    return apiService.get<ApiResponse<Comment[]>>(`/comments?${queryString}`)
  },

  create: async (data: CommentForm): Promise<{ data: Comment }> => {
    return apiService.post<{ data: Comment }>('/comments', { data })
  },
}
