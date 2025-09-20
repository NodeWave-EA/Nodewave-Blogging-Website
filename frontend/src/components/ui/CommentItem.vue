<template>
  <div
    class="comment-item"
    :class="{
      'ml-8': currentDepth > 0,
      'border-l-2 border-zinc-200 dark:border-zinc-700 pl-4': currentDepth > 0,
    }"
  >
    <article
      class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors"
    >
      <!-- Comment Header -->
      <header class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div
              class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            >
              {{ avatarInitials }}
            </div>
          </div>

          <!-- Author Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-2">
              <h4 class="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {{ comment.name }}
              </h4>

              <!-- Admin Badge -->
              <span
                v-if="isAdmin"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                <ShieldCheckIcon class="w-3 h-3 mr-1" />
                Admin
              </span>

              <!-- Author Badge -->
              <span
                v-if="isAuthor"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                <PencilIcon class="w-3 h-3 mr-1" />
                Author
              </span>
            </div>

            <div class="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
              <time :datetime="comment.createdAt" :title="fullDate">
                {{ relativeTime }}
              </time>

              <!-- Status indicator for pending comments -->
              <span
                v-if="comment.status === 'pending'"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                <ClockIcon class="w-3 h-3 mr-1" />
                Pending approval
              </span>
            </div>
          </div>
        </div>

        <!-- Actions Menu -->
        <div class="flex-shrink-0">
          <Menu as="div" class="relative">
            <MenuButton
              class="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <EllipsisHorizontalIcon class="w-5 h-5" />
            </MenuButton>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleReport"
                    :class="[
                      active ? 'bg-zinc-100 dark:bg-zinc-700' : '',
                      'flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300',
                    ]"
                  >
                    <FlagIcon class="w-4 h-4 mr-3" />
                    Report comment
                  </button>
                </MenuItem>

                <MenuItem v-if="canDelete" v-slot="{ active }">
                  <button
                    @click="handleDelete"
                    :class="[
                      active ? 'bg-red-50 dark:bg-red-900/20' : '',
                      'flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400',
                    ]"
                  >
                    <TrashIcon class="w-4 h-4 mr-3" />
                    Delete comment
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </header>

      <!-- Comment Content -->
      <div class="prose prose-sm dark:prose-invert max-w-none mb-4">
        <p class="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {{ comment.content }}
        </p>
      </div>

      <!-- Comment Footer -->
      <footer class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Like Button -->
          <button
            @click="handleLike"
            :disabled="likingInProgress"
            class="flex items-center space-x-1 text-sm transition-colors"
            :class="[
              isLiked
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400',
            ]"
          >
            <HeartIcon
              :class="[
                'w-4 h-4 transition-transform',
                isLiked ? 'fill-current scale-110' : '',
                likingInProgress ? 'animate-pulse' : '',
              ]"
            />
            <span>{{ likeCount }}</span>
          </button>

          <!-- Reply Button -->
          <button
            v-if="allowReplies && currentDepth < maxDepth"
            @click="toggleReplyForm"
            class="flex items-center space-x-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChatBubbleLeftIcon class="w-4 h-4" />
            <span>Reply</span>
          </button>

          <!-- Show Replies Toggle -->
          <button
            v-if="hasReplies"
            @click="toggleReplies"
            class="flex items-center space-x-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChevronDownIcon
              :class="['w-4 h-4 transition-transform', showReplies ? 'rotate-180' : '']"
            />
            <span>{{ replyCount }} {{ replyCount === 1 ? 'reply' : 'replies' }}</span>
          </button>
        </div>

        <!-- Share Button -->
        <button
          @click="shareComment"
          class="flex items-center space-x-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ShareIcon class="w-4 h-4" />
          <span class="sr-only">Share comment</span>
        </button>
      </footer>

      <!-- Reply Form -->
      <div v-if="showReplyForm" class="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <CommentForm
          :parent-id="comment.id"
          :loading="replySubmitting"
          :show-guidelines="false"
          :auto-focus="true"
          @submit="handleReplySubmit"
          @cancel="showReplyForm = false"
        />
      </div>

      <!-- Replies -->
      <div v-if="showReplies && hasReplies" class="mt-4 space-y-4">
        <CommentItem
          v-for="reply in sortedReplies"
          :key="reply.id"
          :comment="reply"
          :allow-replies="allowReplies"
          :max-depth="maxDepth"
          :current-depth="currentDepth + 1"
          @reply="$emit('reply', $event)"
          @like="$emit('like', $event)"
          @report="$emit('report', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  EllipsisHorizontalIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ShareIcon,
  FlagIcon,
  TrashIcon,
  ShieldCheckIcon,
  PencilIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import CommentForm from './CommentForm.vue'
import { formatDistanceToNow } from '@/utils/format'
import type { Comment } from '@/types'

interface Props {
  comment: Comment
  allowReplies?: boolean
  maxDepth?: number
  currentDepth?: number
  currentUserId?: number | null
  moderatorIds?: number[]
  authorIds?: number[]
}

interface Emits {
  (e: 'reply', data: { parentId: number; data: any }): void
  (e: 'like', commentId: number): void
  (e: 'report', data: { commentId: number; reason: string }): void
  (e: 'delete', commentId: number): void
}

const props = withDefaults(defineProps<Props>(), {
  allowReplies: true,
  maxDepth: 3,
  currentDepth: 0,
  currentUserId: null,
  moderatorIds: () => [],
  authorIds: () => [],
})

const emit = defineEmits<Emits>()

// Reactive state
const showReplyForm = ref(false)
const showReplies = ref(true)
const replySubmitting = ref(false)
const likingInProgress = ref(false)
const isLiked = ref(false) // TODO: Get from user's liked comments
const reportDialogOpen = ref(false)

// Computed properties
const avatarInitials = computed(() => {
  const names = props.comment.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return props.comment.name.substring(0, 2).toUpperCase()
})

const isAdmin = computed(() => {
  // Check if comment author is admin/moderator
  return props.moderatorIds.includes(props.comment.id) // This should be author ID, not comment ID
})

const isAuthor = computed(() => {
  // Check if comment author is the blog post author
  return props.authorIds.includes(props.comment.id) // This should be author ID, not comment ID
})

const canDelete = computed(() => {
  // User can delete their own comments or if they're admin
  return props.currentUserId === props.comment.id || isAdmin.value // This should compare proper user IDs
})

const relativeTime = computed(() => {
  return formatDistanceToNow(new Date(props.comment.createdAt), { addSuffix: true })
})

const fullDate = computed(() => {
  return new Date(props.comment.createdAt).toLocaleString()
})

const likeCount = computed(() => {
  return (props.comment as any).likeCount || 0 // Type assertion until we fix the Comment interface
})

const hasReplies = computed(() => {
  return props.comment.replies?.data && props.comment.replies.data.length > 0
})

const replyCount = computed(() => {
  return props.comment.replies?.data?.length || 0
})

const sortedReplies = computed(() => {
  if (!props.comment.replies?.data) return []

  // Sort replies by creation date (oldest first for replies)
  return [...props.comment.replies.data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
})

// Methods
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
}

const toggleReplies = () => {
  showReplies.value = !showReplies.value
}

const handleReplySubmit = async (replyData: any) => {
  replySubmitting.value = true

  try {
    emit('reply', { parentId: props.comment.id, data: replyData })
    showReplyForm.value = false
  } finally {
    replySubmitting.value = false
  }
}

const handleLike = async () => {
  if (likingInProgress.value) return

  likingInProgress.value = true

  try {
    emit('like', props.comment.id)
    isLiked.value = !isLiked.value
  } finally {
    likingInProgress.value = false
  }
}

const handleReport = () => {
  const reason = prompt('Please specify the reason for reporting this comment:')
  if (reason && reason.trim()) {
    emit('report', { commentId: props.comment.id, reason: reason.trim() })
  }
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
    emit('delete', props.comment.id)
  }
}

const shareComment = async () => {
  const url = `${window.location.origin}${window.location.pathname}#comment-${props.comment.id}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Comment by ' + props.comment.name,
        text: props.comment.content.substring(0, 100) + '...',
        url: url,
      })
    } catch (err) {
      // Fallback to clipboard
      copyToClipboard(url)
    }
  } else {
    copyToClipboard(url)
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Show success message (could emit event or use toast)
    console.log('Comment link copied to clipboard')
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}
</script>

<style scoped>
.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover {
  transform: translateY(-1px);
}

/* Nested comment styling */
.comment-item.ml-8 {
  position: relative;
}

.comment-item.ml-8::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgb(59 130 246), transparent);
}

/* Like button animation */
.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Heart animation */
.scale-110 {
  transform: scale(1.1);
}

/* Menu transitions */
.transition {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow,
    transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.ease-in {
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.duration-100 {
  transition-duration: 100ms;
}

.duration-75 {
  transition-duration: 75ms;
}
</style>
