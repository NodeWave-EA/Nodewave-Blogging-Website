<template>
  <div
    class="comment-skeleton bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 animate-pulse"
  >
    <!-- Header -->
    <div class="flex items-start space-x-3 mb-3">
      <!-- Avatar skeleton -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
      </div>

      <!-- Author info skeleton -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <!-- Name skeleton -->
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
          <!-- Badge skeleton (sometimes) -->
          <div
            v-if="Math.random() > 0.7"
            class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-12"
          ></div>
        </div>
        <!-- Date skeleton -->
        <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
      </div>

      <!-- Menu skeleton -->
      <div class="flex-shrink-0">
        <div class="w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>

    <!-- Content skeleton -->
    <div class="space-y-2 mb-4">
      <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
      <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
      <div v-if="multiLine" class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6"></div>
      <div
        v-if="multiLine && Math.random() > 0.5"
        class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"
      ></div>
    </div>

    <!-- Footer skeleton -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Like button skeleton -->
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-4"></div>
        </div>

        <!-- Reply button skeleton -->
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-8"></div>
        </div>

        <!-- Replies count skeleton (sometimes) -->
        <div v-if="showReplies && Math.random() > 0.6" class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-12"></div>
        </div>
      </div>

      <!-- Share button skeleton -->
      <div class="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
    </div>

    <!-- Reply skeletons (nested) -->
    <div v-if="showReplies && hasNestedReplies" class="mt-4 ml-8 space-y-4">
      <CommentSkeleton
        v-for="n in nestedCount"
        :key="n"
        :multi-line="false"
        :show-replies="false"
        :is-nested="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  multiLine?: boolean
  showReplies?: boolean
  isNested?: boolean
  nestedCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  multiLine: true,
  showReplies: true,
  isNested: false,
  nestedCount: 1,
})

// Computed properties
const hasNestedReplies = computed(() => {
  return props.showReplies && !props.isNested && Math.random() > 0.7
})
</script>

<style scoped>
/* Pulse animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

/* Stagger animation for multiple skeletons */
.comment-skeleton:nth-child(1) {
  animation-delay: 0ms;
}

.comment-skeleton:nth-child(2) {
  animation-delay: 100ms;
}

.comment-skeleton:nth-child(3) {
  animation-delay: 200ms;
}

.comment-skeleton:nth-child(4) {
  animation-delay: 300ms;
}

.comment-skeleton:nth-child(n + 5) {
  animation-delay: 400ms;
}

/* Nested comment styling */
.ml-8 .comment-skeleton {
  border-left: 2px solid rgb(229 231 235);
}

.dark .ml-8 .comment-skeleton {
  border-left: 2px solid rgb(63 63 70);
}

/* Subtle variations in skeleton widths */
.comment-skeleton:nth-child(odd) .h-4:first-child {
  width: 95%;
}

.comment-skeleton:nth-child(even) .h-4:first-child {
  width: 88%;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-x-4 > :not([hidden]) ~ :not([hidden]) {
    margin-left: 0.75rem;
  }

  .space-x-3 > :not([hidden]) ~ :not([hidden]) {
    margin-left: 0.5rem;
  }
}
</style>
