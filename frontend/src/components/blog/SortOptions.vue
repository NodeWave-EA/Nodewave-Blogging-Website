<template>
  <div class="relative inline-block" @keydown.down.prevent="focusNext" @keydown.up.prevent="focusPrev"
    @keydown.esc="close" ref="root">
    <button type="button" ref="buttonRef"
      class="appearance-none w-full bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-3 pr-10 flex items-center justify-between shadow-md hover:shadow-lg"
      :aria-expanded="open" :aria-haspopup="true" @click="toggle" @blur="onBlur">
      <span class="truncate">{{ selectedLabel }}</span>
      <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor"
        aria-hidden="true">
        <path fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z"
          clip-rule="evenodd" />
      </svg>
    </button>

    <teleport to="body">
      <transition name="fade">
        <ul v-if="open" ref="menuRef" role="listbox" tabindex="-1" :style="menuStyle"
          class="absolute z-[9999] mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 overflow-hidden">
          <li v-for="(opt, idx) in optionsToUse" :key="opt.value" :data-index="idx"
            :aria-selected="modelValue === opt.value" role="option" @mousedown.prevent @click="selectOption(opt.value)"
            @mouseenter="focusIndex(idx)" :class="[
              'px-4 py-2 text-sm cursor-pointer truncate',
              modelValue === opt.value
                ? 'bg-slate-100 dark:bg-slate-900 font-semibold'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700',
            ]" :ref="(el) => setOptionRef(el, idx)">
            {{ opt.label }}
          </li>
        </ul>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onUnmounted, ref } from 'vue';

  interface SortOption {
    label: string
    value: string
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      options?: SortOption[]
      placeholder?: string
    }>(),
    {
      modelValue: 'title',
      options: undefined,
      placeholder: 'Sort by',
    },
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const open = ref(false)
  const modelValue = computed<string>({
    get: () => (props.modelValue ?? 'newest') as string,
    set: (v: string) => emit('update:modelValue', v),
  })

  const optionRefs = ref<Array<any | null>>([])
  const focusedIndex = ref(-1)
  const root = ref<Element | null>(null)
  const buttonRef = ref<HTMLElement | null>(null)
  const menuRef = ref<HTMLElement | null>(null)
  const menuStyle = ref<Record<string, string>>({})

  const defaultOptions: SortOption[] = [
    { label: 'Alphabetical', value: 'title' },
    { label: 'Featured', value: 'featured' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Popular', value: 'popular' },
  ]

  const optionsToUse = computed(() =>
    props.options && props.options.length ? props.options : defaultOptions,
  )

  const selectedLabel = computed(() => {
    const found = optionsToUse.value.find((o) => o.value === modelValue.value)
    return found ? found.label : optionsToUse.value[0].label
  })

  const toggle = () => {
    open.value = !open.value
    if (open.value) {
      // focus current selection
      const idx = optionsToUse.value.findIndex((o) => o.value === modelValue.value)
      focusIndex(idx === -1 ? 0 : idx)
      // position menu on open
      nextTick(positionMenu)
      addDocListeners()
    } else {
      removeDocListeners()
    }
  }

  const close = () => {
    open.value = false
    focusedIndex.value = -1
  }

  const selectOption = (value: string) => {
    modelValue.value = value
    emit('update:modelValue', value)
    close()
  }

  const focusIndex = (idx: number) => {
    focusedIndex.value = idx
    const elAny = optionRefs.value[idx]
    const el = elAny as HTMLElement | null
    if (el && typeof (el as HTMLElement).focus === 'function') (el as HTMLElement).focus()
  }

  const focusNext = () => {
    const next = (focusedIndex.value + 1) % optionsToUse.value.length
    focusIndex(next)
  }

  const focusPrev = () => {
    const prev = (focusedIndex.value - 1 + optionsToUse.value.length) % optionsToUse.value.length
    focusIndex(prev)
  }

  const setOptionRef = (el: any, idx: number) => {
    // Store the element (or null) at the index so focus and cleanup work predictably
    optionRefs.value[idx] = el
  }

  const onBlur = (e: FocusEvent) => {
    // if focus leaves the root, close
    const related = e.relatedTarget as Node | null
    if (!root.value) return
    // because menu is teleported, also check menuRef
    if (!related || (!root.value.contains(related) && !(menuRef.value && menuRef.value.contains(related)))) {
      close()
    }
  }

  const positionMenu = () => {
    if (!buttonRef.value) return
    const rect = buttonRef.value.getBoundingClientRect()
    const top = rect.bottom + window.scrollY
    const left = rect.left + window.scrollX
    menuStyle.value = {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${rect.width}px`,
    }
  }

  const handleDocClick = (e: MouseEvent) => {
    const target = e.target as Node | null
    if (!target) return
    if (root.value && root.value.contains(target)) return
    if (menuRef.value && menuRef.value.contains(target)) return
    close()
  }

  const handleWindowChange = () => {
    if (!open.value) return
    positionMenu()
  }

  const addDocListeners = () => {
    document.addEventListener('mousedown', handleDocClick)
    window.addEventListener('resize', handleWindowChange)
    window.addEventListener('scroll', handleWindowChange, true)
  }

  const removeDocListeners = () => {
    document.removeEventListener('mousedown', handleDocClick)
    window.removeEventListener('resize', handleWindowChange)
    window.removeEventListener('scroll', handleWindowChange, true)
  }

  onUnmounted(() => {
    removeDocListeners()
  })
</script>

<style scoped>

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
