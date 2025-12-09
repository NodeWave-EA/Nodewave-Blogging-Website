<template>
  <div class="relative">
    <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
    <input
      ref="inputRef"
      :value="modelValue"
      @input="onInput"
      @keydown.enter.prevent="$emit('enter')"
      @keydown.escape="$emit('escape')"
      :placeholder="placeholder"
      class="w-full pl-12 pr-10 md:pr-12 py-3 md:py-4 md:text-2xl text-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-4 focus:ring-primary-500 focus:border-primary-500 dark:text-white placeholder:text-zinc-400 transition-colors shadow-sm dark:shadow-none"
    />
    <button
      v-if="modelValue"
      @click="$emit('clear')"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"
    >
      <slot name="clear">
        <svg
          class="w-4 h-4 text-zinc-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M6.28 5.22a.75.75 0 011.06 0L10 7.88l2.66-2.66a.75.75 0 111.06 1.06L11.06 8.94l2.66 2.66a.75.75 0 11-1.06 1.06L10 10l-2.66 2.66a.75.75 0 11-1.06-1.06L8.94 8.94 6.28 6.28a.75.75 0 010-1.06z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits(['update:modelValue', 'enter', 'escape', 'clear'])

const inputRef = ref<HTMLInputElement | null>(null)

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (!target) return
  emit('update:modelValue', target.value)
}

watch(
  () => props.modelValue,
  () => {
    // optional: do something on value change
  },
)

// expose focus method to parent via defineExpose
function focus() {
  nextTick(() => inputRef.value?.focus())
}

defineExpose({ focus })
</script>

<style scoped></style>
