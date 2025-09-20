<template>
  <div
    class="comment-form bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6"
  >
    <h4 v-if="parentId" class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
      Reply to comment
    </h4>
    <h4 v-else class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Leave a comment</h4>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name and Email Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Name *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :disabled="loading"
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Your name"
          />
          <span v-if="errors.name" class="text-sm text-red-600 dark:text-red-400 mt-1">{{
            errors.name
          }}</span>
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Email *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="loading"
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="your.email@example.com"
          />
          <span v-if="errors.email" class="text-sm text-red-600 dark:text-red-400 mt-1">{{
            errors.email
          }}</span>
        </div>
      </div>

      <!-- Comment Content -->
      <div>
        <label
          for="content"
          class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Comment *
        </label>
        <textarea
          id="content"
          v-model="form.content"
          rows="4"
          required
          :disabled="loading"
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px]"
          placeholder="Share your thoughts..."
          @keydown.ctrl.enter="handleSubmit"
          @keydown.meta.enter="handleSubmit"
        ></textarea>
        <span v-if="errors.content" class="text-sm text-red-600 dark:text-red-400 mt-1">{{
          errors.content
        }}</span>

        <!-- Character count -->
        <div class="flex justify-between items-center mt-2">
          <div class="text-xs text-zinc-500 dark:text-zinc-400">Press Ctrl+Enter to submit</div>
          <div
            class="text-xs"
            :class="
              characterCount > maxLength
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-500 dark:text-zinc-400'
            "
          >
            {{ characterCount }}/{{ maxLength }}
          </div>
        </div>
      </div>

      <!-- Submit and Cancel Buttons -->
      <div class="flex items-center justify-between pt-4">
        <button
          v-if="parentId"
          type="button"
          @click="$emit('cancel')"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <div class="flex items-center space-x-3">
          <!-- Preview Toggle -->
          <button
            v-if="form.content.trim()"
            type="button"
            @click="showPreview = !showPreview"
            :disabled="loading"
            class="px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ showPreview ? 'Edit' : 'Preview' }}
          </button>

          <button
            type="submit"
            :disabled="loading || !isFormValid || characterCount > maxLength"
            class="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <LoadingSpinner v-if="loading" class="w-4 h-4" />
            <span>{{ parentId ? 'Reply' : 'Submit Comment' }}</span>
          </button>
        </div>
      </div>

      <!-- Preview Mode -->
      <div
        v-if="showPreview && form.content.trim()"
        class="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
      >
        <h5 class="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Preview:</h5>
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <p class="whitespace-pre-wrap break-words">{{ form.content }}</p>
        </div>
      </div>

      <!-- Guidelines -->
      <div
        v-if="showGuidelines"
        class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
      >
        <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Community Guidelines:
        </h5>
        <ul class="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Be respectful and constructive in your comments</li>
          <li>• Stay on topic and add value to the discussion</li>
          <li>• No spam, self-promotion, or offensive language</li>
          <li>• Comments are moderated and may take time to appear</li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  parentId?: number | null
  loading?: boolean
  showGuidelines?: boolean
  maxLength?: number
  autoFocus?: boolean
}

interface Emits {
  (
    e: 'submit',
    data: { name: string; email: string; content: string; parentId?: number | null },
  ): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  parentId: null,
  loading: false,
  showGuidelines: true,
  maxLength: 1000,
  autoFocus: false,
})

const emit = defineEmits<Emits>()

// Form state
const form = ref({
  name: '',
  email: '',
  content: '',
})

const errors = ref({
  name: '',
  email: '',
  content: '',
})

const showPreview = ref(false)

// Computed properties
const characterCount = computed(() => form.value.content.length)

const isFormValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.email.trim() &&
    isValidEmail(form.value.email) &&
    form.value.content.trim() &&
    characterCount.value <= props.maxLength
  )
})

// Methods
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = (): boolean => {
  // Clear previous errors
  errors.value = { name: '', email: '', content: '' }
  let isValid = true

  // Validate name
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
    isValid = false
  }

  // Validate email
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate content
  if (!form.value.content.trim()) {
    errors.value.content = 'Comment content is required'
    isValid = false
  } else if (form.value.content.trim().length < 10) {
    errors.value.content = 'Comment must be at least 10 characters'
    isValid = false
  } else if (characterCount.value > props.maxLength) {
    errors.value.content = `Comment must be less than ${props.maxLength} characters`
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm() || props.loading) {
    return
  }

  emit('submit', {
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    content: form.value.content.trim(),
    parentId: props.parentId,
  })

  // Reset form if not a reply (replies usually close the form)
  if (!props.parentId) {
    resetForm()
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    content: '',
  }
  errors.value = { name: '', email: '', content: '' }
  showPreview.value = false
}

const focusForm = async () => {
  await nextTick()
  const nameInput = document.getElementById('name')
  if (nameInput) {
    nameInput.focus()
  }
}

// Lifecycle
onMounted(() => {
  if (props.autoFocus) {
    focusForm()
  }

  // Load saved form data from localStorage (for user convenience)
  const savedName = localStorage.getItem('comment-author-name')
  const savedEmail = localStorage.getItem('comment-author-email')

  if (savedName) form.value.name = savedName
  if (savedEmail) form.value.email = savedEmail
})

// Watch for name/email changes to save to localStorage
import { watch } from 'vue'

watch(
  () => form.value.name,
  (newName) => {
    if (newName.trim()) {
      localStorage.setItem('comment-author-name', newName.trim())
    }
  },
)

watch(
  () => form.value.email,
  (newEmail) => {
    if (newEmail.trim() && isValidEmail(newEmail)) {
      localStorage.setItem('comment-author-email', newEmail.trim())
    }
  },
)

// Expose methods for parent component
defineExpose({
  resetForm,
  focusForm,
})
</script>

<style scoped>
.comment-form {
  transition: all 0.2s ease;
}

.comment-form:focus-within {
  --tw-ring-color: rgb(59 130 246 / 0.2);
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-shadow: 0 0 0 calc(2px + 0px) var(--tw-ring-color);
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--tw-shadow, 0 0 #0000);
}

/* Custom scrollbar for textarea */
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgb(209 213 219) transparent;
}

textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: rgb(209 213 219);
  border-radius: 4px;
}

.dark textarea {
  scrollbar-color: rgb(75 85 99) transparent;
}

.dark textarea::-webkit-scrollbar-thumb {
  background-color: rgb(75 85 99);
}

/* Smooth transitions */
.prose p {
  transition: all 0.2s ease;
}
</style>
