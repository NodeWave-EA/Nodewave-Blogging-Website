<template>
  <div class="comments-section">
    <!-- Comments Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-zinc-900 dark:text-white">
        Comments
        <span v-if="comments.length > 0" class="text-zinc-500 dark:text-zinc-400 font-normal">
          ({{ comments.length }})
        </span>
      </h3>

      <!-- Sort Options -->
      <div class="flex items-center space-x-2 text-sm">
        <label class="text-zinc-600 dark:text-zinc-400">Sort by:</label>
        <select
          v-model="sortBy"
          @change="sortComments"
          class="border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>

    <!-- Comment Form -->
    <div v-if="allowComments" class="mb-8">
      <CommentForm :loading="submitting" :parent-id="null" @submit="handleCommentSubmit" />
    </div>

    <!-- Comments List -->
    <div v-if="sortedComments.length > 0" class="space-y-6">
      <CommentItem
        v-for="comment in sortedComments"
        :key="comment.id"
        :comment="comment"
        :allow-replies="allowComments"
        :max-depth="maxDepth"
        :current-depth="0"
        @reply="handleReply"
        @like="handleLike"
        @report="handleReport"
        @delete="handleDelete"
      />

      <!-- Load More Button -->
      <div v-if="hasMoreComments" class="text-center">
        <button
          @click="loadMoreComments"
          :disabled="loadingMore"
          class="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <LoadingSpinner v-if="loadingMore" class="w-4 h-4 mr-2" />
          Load more comments
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center py-12">
      <ChatBubbleLeftEllipsisIcon class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
      <h4 class="text-lg font-medium text-zinc-900 dark:text-white mb-2">No comments yet</h4>
      <p class="text-zinc-500 dark:text-zinc-400 mb-4">Be the first to share your thoughts!</p>
      <button
        v-if="allowComments"
        @click="focusCommentForm"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Write a comment
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <CommentSkeleton v-for="n in 3" :key="n" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import CommentSkeleton from './CommentSkeleton.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { apiService } from '@/services/api'
import type { Comment, StrapiResponse } from '@/types'

interface Props {
  postId: number
  allowComments?: boolean
  maxDepth?: number
  pageSize?: number
}

interface Emits {
  (e: 'comment-added', comment: Comment): void
  (e: 'comment-updated', comment: Comment): void
  (e: 'comment-deleted', commentId: number): void
}

const props = withDefaults(defineProps<Props>(), {
  allowComments: true,
  maxDepth: 3,
  pageSize: 10,
})

const emit = defineEmits<Emits>()

// Reactive state
const comments = ref<Comment[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const sortBy = ref<'newest' | 'oldest' | 'popular'>('newest')
const currentPage = ref(1)
const totalComments = ref(0)

// Computed
const sortedComments = computed(() => {
  const sorted = [...comments.value]

  switch (sortBy.value) {
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    case 'popular':
      return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    default: // newest
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }
})

const hasMoreComments = computed(() => {
  return comments.value.length < totalComments.value
})

// Methods
const loadComments = async (page: number = 1) => {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const response = (await apiService.get(`/api/comments`, {
      params: {
        'filters[blogPost][id][$eq]': props.postId,
        'filters[status][$eq]': 'approved',
        'filters[parent][$null]': true, // Only top-level comments
        'populate[0]': 'author',
        'populate[1]': 'replies.author',
        'populate[2]': 'replies.replies.author',
        'sort[0]': sortBy.value === 'oldest' ? 'createdAt:asc' : 'createdAt:desc',
        'pagination[page]': page,
        'pagination[pageSize]': props.pageSize,
      },
    })) as StrapiResponse<Comment[]>

    if (page === 1) {
      comments.value = response.data || []
    } else {
      comments.value.push(...(response.data || []))
    }

    totalComments.value = response.meta?.pagination?.total || 0
    currentPage.value = page
  } catch (error) {
    console.error('Error loading comments:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreComments = () => {
  if (!loadingMore.value && hasMoreComments.value) {
    loadComments(currentPage.value + 1)
  }
}

const sortComments = () => {
  // Reload comments with new sort order
  loadComments(1)
}

const handleCommentSubmit = async (commentData: any) => {
  submitting.value = true

  try {
    const response = (await apiService.post('/api/comments', {
      data: {
        ...commentData,
        blogPost: props.postId,
        status: 'pending', // Comments need approval
      },
    })) as StrapiResponse<Comment>

    // Add comment to list if approved, or show pending message
    if (response.data.status === 'approved') {
      comments.value.unshift(response.data)
      emit('comment-added', response.data)
    } else {
      // Show success message for pending comment
      showSuccessMessage('Comment submitted and is awaiting approval')
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
    showErrorMessage('Failed to submit comment. Please try again.')
  } finally {
    submitting.value = false
  }
}

const handleReply = async (data: { parentId: number; data: any }) => {
  const { parentId, data: replyData } = data
  try {
    const response = (await apiService.post('/api/comments', {
      data: {
        ...replyData,
        blogPost: props.postId,
        parent: parentId,
        status: 'pending',
      },
    })) as StrapiResponse<Comment>

    // Update parent comment with new reply
    updateCommentReplies(parentId, response.data)
    emit('comment-added', response.data)
  } catch (error) {
    console.error('Error submitting reply:', error)
    showErrorMessage('Failed to submit reply. Please try again.')
  }
}

const handleLike = async (commentId: number) => {
  try {
    await apiService.post(`/api/comments/${commentId}/like`)

    // Update comment like count
    updateCommentLikes(commentId)
  } catch (error) {
    console.error('Error liking comment:', error)
  }
}

const handleReport = async (data: { commentId: number; reason: string }) => {
  const { commentId, reason } = data
  try {
    await apiService.post(`/api/comments/${commentId}/report`, {
      data: { reason },
    })

    showSuccessMessage('Comment reported. Thank you for helping keep our community safe.')
  } catch (error) {
    console.error('Error reporting comment:', error)
    showErrorMessage('Failed to report comment. Please try again.')
  }
}

const handleDelete = async (commentId: number) => {
  try {
    await apiService.delete(`/api/comments/${commentId}`)

    // Remove comment from list
    removeComment(commentId)
    emit('comment-deleted', commentId)

    showSuccessMessage('Comment deleted successfully')
  } catch (error) {
    console.error('Error deleting comment:', error)
    showErrorMessage('Failed to delete comment. Please try again.')
  }
}

// Helper functions
const updateCommentReplies = (parentId: number, newReply: Comment) => {
  const updateReplies = (commentList: Comment[]): boolean => {
    for (const comment of commentList) {
      if (comment.id === parentId) {
        if (!comment.replies) {
          comment.replies = { data: [] }
        }
        comment.replies.data.unshift(newReply)
        return true
      }

      if (comment.replies?.data && updateReplies(comment.replies.data)) {
        return true
      }
    }
    return false
  }

  updateReplies(comments.value)
}

const updateCommentLikes = (commentId: number) => {
  const updateLikes = (commentList: Comment[]): boolean => {
    for (const comment of commentList) {
      if (comment.id === commentId) {
        comment.likeCount = (comment.likeCount || 0) + 1
        return true
      }

      if (comment.replies?.data && updateLikes(comment.replies.data)) {
        return true
      }
    }
    return false
  }

  updateLikes(comments.value)
}

const removeComment = (commentId: number) => {
  const removeFromList = (commentList: Comment[]): Comment[] => {
    return commentList.filter((comment) => {
      if (comment.id === commentId) {
        return false
      }

      if (comment.replies?.data) {
        comment.replies.data = removeFromList(comment.replies.data)
      }

      return true
    })
  }

  comments.value = removeFromList(comments.value)
}

const focusCommentForm = () => {
  const commentForm = document.querySelector('.comment-form textarea') as HTMLTextAreaElement
  if (commentForm) {
    commentForm.focus()
  }
}

const showSuccessMessage = (message: string) => {
  // Emit event or use toast notification system
  console.log('Success:', message)
}

const showErrorMessage = (message: string) => {
  // Emit event or use toast notification system
  console.error('Error:', message)
}

// Lifecycle
onMounted(() => {
  if (props.allowComments) {
    loadComments()
  }
})
</script>

<style scoped>
.comments-section {
  max-width: none;
}

/* Ensure proper spacing for nested comments */
.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1.5rem;
}

/* Custom select styling */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%939496' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}
</style>
