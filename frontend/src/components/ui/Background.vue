<template>
  <div class="fixed inset-0 -z-50 overflow-hidden">
    <!-- Base gradient background -->
    <div class="absolute inset-0 transition-all duration-700 ease-in-out" :class="backgroundClasses" />

    <!-- Background Pattern -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 backdrop-blur-sm"></div>
      <div class="absolute inset-0 opacity-30" style="
          background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.1%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
        "></div>
    </div>

    <!-- Animated gradient orbs -->
    <div class="absolute inset-0">
      <!-- Primary orb -->
      <div
        class="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-in-out animate-blob"
        :class="primaryOrbClasses" :style="primaryOrbStyle" />

      <!-- Secondary orb -->
      <div
        class="absolute w-80 h-80 rounded-full opacity-15 blur-3xl transition-all duration-1000 ease-in-out animate-blob"
        :class="secondaryOrbClasses" :style="secondaryOrbStyle" />

      <!-- Tertiary orb -->
      <div
        class="absolute w-72 h-72 rounded-full opacity-10 blur-3xl transition-all duration-1000 ease-in-out animate-blob"
        :class="tertiaryOrbClasses" :style="tertiaryOrbStyle" />
    </div>

    <!-- Subtle texture overlay -->
    <div v-if="showTexture" class="absolute inset-0 opacity-[0.015] mix-blend-overlay transition-opacity duration-500"
      :class="textureClasses" />

    <!-- Grid pattern overlay for certain pages -->
    <div v-if="showGrid" class="absolute inset-0 opacity-5 transition-opacity duration-500" :style="gridPattern" />
  </div>
</template>

<script setup lang="ts">
  import { useTheme } from '@/composables/useTheme';
  import { computed, onMounted, ref, watch } from 'vue';

  export interface BackgroundConfig {
    style: 'gradient' | 'solid' | 'minimal' | 'vibrant'
    variant: 'primary' | 'secondary' | 'neutral' | 'warm' | 'cool'
    intensity: 'subtle' | 'normal' | 'bold'
    texture: boolean
    grid: boolean
    animated: boolean
  }

  interface Props {
    page?: string
    config?: Partial<BackgroundConfig>
  }

  const props = withDefaults(defineProps<Props>(), {
    page: 'default',
    config: () => ({}),
  })

  const { isDark } = useTheme()

  // Page-specific configurations using modern design patterns
  const pageConfigs: Record<string, Partial<BackgroundConfig>> = {
    home: {
      style: 'gradient',
      variant: 'primary',
      intensity: 'normal',
      texture: true,
      grid: false,
      animated: true,
    },
    blog: {
      style: 'gradient',
      variant: 'neutral',
      intensity: 'subtle',
      texture: true,
      grid: true,
      animated: true,
    },
    post: {
      style: 'minimal',
      variant: 'neutral',
      intensity: 'subtle',
      texture: true,
      grid: false,
      animated: false,
    },
    about: {
      style: 'gradient',
      variant: 'warm',
      intensity: 'normal',
      texture: true,
      grid: false,
      animated: true,
    },
    contact: {
      style: 'gradient',
      variant: 'cool',
      intensity: 'normal',
      texture: true,
      grid: false,
      animated: true,
    },
    author: {
      style: 'gradient',
      variant: 'secondary',
      intensity: 'subtle',
      texture: true,
      grid: false,
      animated: true,
    },
    category: {
      style: 'gradient',
      variant: 'neutral',
      intensity: 'subtle',
      texture: true,
      grid: true,
      animated: true,
    },
    default: {
      style: 'minimal',
      variant: 'neutral',
      intensity: 'subtle',
      texture: true,
      grid: false,
      animated: false,
    },
  }

  // Default configuration
  const defaultConfig: BackgroundConfig = {
    style: 'minimal',
    variant: 'neutral',
    intensity: 'subtle',
    texture: true,
    grid: false,
    animated: false,
  }

  // Merged configuration
  const config = computed(() => ({
    ...defaultConfig,
    ...(pageConfigs[props.page] || pageConfigs.default),
    ...props.config,
  }))

  // Background classes based on configuration
  const backgroundClasses = computed(() => {
    const { style, variant } = config.value

    const baseClasses = []

    if (style === 'solid') {
      baseClasses.push(isDark.value ? 'bg-zinc-950' : 'bg-zinc-900/70')
    } else if (style === 'minimal') {
      baseClasses.push(isDark.value ? 'bg-zinc-950' : 'bg-zinc-900/60')
    } else if (style === 'gradient') {
      // Modern gradient backgrounds
      const gradients = {
        primary: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-blue-950/20 to-purple-950/20'
          : 'bg-gradient-to-br from-zinc-900/70 via-blue-50/50 to-purple-50/50',
        secondary: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-slate-900/30 to-zinc-900'
          : 'bg-gradient-to-br from-zinc-900/70 via-slate-50/50 to-zinc-50/50',
        neutral: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-slate-950/30'
          : 'bg-gradient-to-br from-zinc-900/70 via-white to-slate-50/30',
        warm: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-orange-950/20 to-amber-950/20'
          : 'bg-gradient-to-br from-zinc-900/70 via-orange-50/30 to-amber-50/30',
        cool: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-cyan-950/20 to-blue-950/20'
          : 'bg-gradient-to-br from-zinc-900/70 via-cyan-50/30 to-blue-50/30',
      }
      baseClasses.push(gradients[variant])
    } else if (style === 'vibrant') {
      const vibrantGradients = {
        primary: isDark.value
          ? 'bg-gradient-to-br from-blue-950 via-purple-950 to-zinc-950'
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100',
        secondary: isDark.value
          ? 'bg-gradient-to-br from-slate-950 via-zinc-950 to-gray-950'
          : 'bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-100',
        neutral: isDark.value
          ? 'bg-gradient-to-br from-zinc-950 via-slate-950 to-neutral-950'
          : 'bg-gradient-to-br from-zinc-100 via-slate-100 to-neutral-100',
        warm: isDark.value
          ? 'bg-gradient-to-br from-orange-950 via-red-950 to-zinc-950'
          : 'bg-gradient-to-br from-orange-100 via-red-100 to-pink-100',
        cool: isDark.value
          ? 'bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950'
          : 'bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100',
      }
      baseClasses.push(vibrantGradients[variant])
    }

    return baseClasses.join(' ')
  })

  // Animated orb positions and colors
  const orbPositions = ref({
    primary: { top: '10%', left: '15%' },
    secondary: { top: '60%', right: '20%' },
    tertiary: { bottom: '20%', left: '20%' },
  })

  const primaryOrbClasses = computed(() => {
    const colors = {
      primary: isDark.value ? 'bg-blue-600' : 'bg-blue-400',
      secondary: isDark.value ? 'bg-slate-600' : 'bg-slate-400',
      neutral: isDark.value ? 'bg-zinc-600' : 'bg-zinc-400',
      warm: isDark.value ? 'bg-orange-600' : 'bg-orange-400',
      cool: isDark.value ? 'bg-cyan-600' : 'bg-cyan-400',
    }
    return colors[config.value.variant]
  })

  const secondaryOrbClasses = computed(() => {
    const colors = {
      primary: isDark.value ? 'bg-purple-600' : 'bg-purple-400',
      secondary: isDark.value ? 'bg-zinc-600' : 'bg-zinc-400',
      neutral: isDark.value ? 'bg-slate-600' : 'bg-slate-400',
      warm: isDark.value ? 'bg-amber-600' : 'bg-amber-400',
      cool: isDark.value ? 'bg-blue-600' : 'bg-blue-400',
    }
    return colors[config.value.variant]
  })

  const tertiaryOrbClasses = computed(() => {
    const colors = {
      primary: isDark.value ? 'bg-indigo-600' : 'bg-indigo-400',
      secondary: isDark.value ? 'bg-gray-600' : 'bg-gray-400',
      neutral: isDark.value ? 'bg-neutral-600' : 'bg-neutral-400',
      warm: isDark.value ? 'bg-red-600' : 'bg-red-400',
      cool: isDark.value ? 'bg-teal-600' : 'bg-teal-400',
    }
    return colors[config.value.variant]
  })

  const primaryOrbStyle = computed(() => ({
    top: orbPositions.value.primary.top,
    left: orbPositions.value.primary.left,
    animationDelay: '0s',
    animationDuration: '7s',
  }))

  const secondaryOrbStyle = computed(() => ({
    top: orbPositions.value.secondary.top,
    right: orbPositions.value.secondary.right,
    animationDelay: '2s',
    animationDuration: '9s',
  }))

  const tertiaryOrbStyle = computed(() => ({
    bottom: orbPositions.value.tertiary.bottom,
    left: orbPositions.value.tertiary.left,
    animationDelay: '4s',
    animationDuration: '11s',
  }))

  const showTexture = computed(() => config.value.texture)
  const showGrid = computed(() => config.value.grid)

  const textureClasses = computed(() => {
    return 'bg-noise'
  })

  const gridPattern = computed(() => ({
    backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark.value ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
    backgroundSize: '24px 24px',
  }))

  // Animate orb positions
  const animateOrbs = () => {
    if (!config.value.animated) return

    const randomPosition = () => ({
      primary: {
        top: `${Math.random() * 60 + 10}%`,
        left: `${Math.random() * 60 + 10}%`,
      },
      secondary: {
        top: `${Math.random() * 60 + 20}%`,
        right: `${Math.random() * 60 + 10}%`,
      },
      tertiary: {
        bottom: `${Math.random() * 60 + 10}%`,
        left: `${Math.random() * 60 + 20}%`,
      },
    })

    setInterval(() => {
      orbPositions.value = randomPosition()
    }, 8000)
  }

  onMounted(() => {
    animateOrbs()
  })

  // Watch for theme changes and update smoothly
  watch(
    isDark,
    () => {
      // Theme change is handled automatically by computed properties
    },
    { immediate: true },
  )
</script>

<style scoped>

  /* Noise texture using CSS */
  .bg-noise {
    background-image:
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.3) 0%, transparent 50%);
  }

  /* Custom blob animation with better easing */
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1) rotate(0deg);
    }

    25% {
      transform: translate(20px, -30px) scale(1.1) rotate(90deg);
    }

    50% {
      transform: translate(-20px, 20px) scale(0.9) rotate(180deg);
    }

    75% {
      transform: translate(30px, 10px) scale(1.05) rotate(270deg);
    }

    100% {
      transform: translate(0px, 0px) scale(1) rotate(360deg);
    }
  }

  .animate-blob {
    animation: blob 7s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .animate-blob {
      animation: none;
    }
  }
</style>
