<template>
  <div :class="wrapperClass" :style="{ color: color || undefined }">
    <!-- FontAwesome -->
    <font-awesome-icon v-if="faIcon" :icon="faIcon" :class="iconClass" />

    <!-- Default slot (always available) -->
    <slot v-else :icon-class="iconClass" :color="color" :size="size">
      <!-- Default fallback if no slot is provided -->
      <TagIcon :class="iconClass" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import * as brandIcons from '@fortawesome/free-brands-svg-icons'
import * as regularIcons from '@fortawesome/free-regular-svg-icons'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { TagIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

interface Props {
  icon?: string | null
  color?: string | null
  size?: string | null
  class?: string | null
}

const props = defineProps<Props>()

// --- normalize icon name to PascalCase key (faUser, faGithub etc.)
function resolveIcon(prefix: string, name: string) {
  const key =
    'fa' +
    name.charAt(0).toUpperCase() +
    name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())

  if (prefix === 'fas' && key in solidIcons) return (solidIcons as any)[key]
  if (prefix === 'far' && key in regularIcons) return (regularIcons as any)[key]
  if (prefix === 'fab' && key in brandIcons) return (brandIcons as any)[key]

  return null
}

// --- parser for various input formats
function parseIconRaw(raw: string | undefined): [string, string] | null {
  if (!raw) return null
  const s = raw.trim()

  const colonMatch = s.match(/^([a-zA-Z0-9_-]+)[:/](.+)$/)
  if (colonMatch) {
    const prefix = colonMatch[1].toLowerCase()
    const name = colonMatch[2].replace(/^fa-/, '')
    if (prefix === 'fab' || prefix.includes('brand')) return ['fab', name]
    if (prefix === 'far' || prefix.includes('regular')) return ['far', name]
    return ['fas', name]
  }

  if (s.includes(' ')) {
    const parts = s.split(/\s+/)
    let prefix = 'fas'
    let name = ''
    for (const p of parts) {
      if (p === 'fab' || p === 'fa-brands') prefix = 'fab'
      if (p === 'far' || p === 'fa-regular') prefix = 'far'
      if (p === 'fas' || p === 'fa-solid') prefix = 'fas'
      if (
        p.startsWith('fa-') &&
        !p.includes('brand') &&
        !p.includes('solid') &&
        !p.includes('regular')
      ) {
        name = p.replace(/^fa-/, '')
      } else if (!name && !p.startsWith('fa-')) {
        name = p
      }
    }
    if (!name) name = parts.find((t) => /fa-[a-z0-9-]+/.test(t))?.replace(/^fa-/, '') || ''
    if (!name) return null
    return [prefix, name]
  }

  if (s.startsWith('fa-')) return ['fas', s.replace(/^fa-/, '')]
  return ['fas', s]
}

const faIcon = computed(() => {
  const parsed = parseIconRaw(props.icon ?? undefined)
  if (!parsed) return null
  return resolveIcon(parsed[0], parsed[1])
})

const sizeClass = computed(() => props.size || 'w-6 h-6')
const iconClass = computed(() => `${props.class ?? ''} ${sizeClass.value}`.trim())
const wrapperClass = computed(() => 'inline-flex items-center justify-center')
</script>
