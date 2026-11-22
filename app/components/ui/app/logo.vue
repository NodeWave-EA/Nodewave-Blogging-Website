<script setup lang="ts">
import { computed, useId } from "vue";

import { siteConfig } from "~/app.meta";

export type LogoLetterMode = "wave" | "draw" | "type";

const props = withDefaults(defineProps<{
  /** Render as a home NuxtLink (disable when already inside a link or static loader) */
  asLink?: boolean;
  /** Show the two-line brand wordmark beside the icon */
  showText?: boolean;
  /** Primary brand title text */
  brandText?: string;
  /** Secondary tagline text */
  taglineText?: string;
  /** Master toggle for all logo animations */
  animate?: boolean;
  /** Toggle circuit icon draw animation independently */
  animateIcon?: boolean;
  /** Toggle primary brand title animation independently */
  animateText?: boolean;
  /** Toggle secondary tagline animation independently */
  animateTagline?: boolean;
  /** Animate individual letters instead of whole text lines */
  animateLetters?: boolean;
  /** Per-letter animation style: 'wave' | 'draw' | 'type' */
  letterMode?: LogoLetterMode;
  /** Delay between individual letters in milliseconds */
  letterStagger?: number;
  /** Repeat animations infinitely (set false to animate once on mount) */
  loop?: boolean;
  /** Full animation cycle duration in milliseconds */
  duration?: number;
  /** Opacity (0–1) of the persistent base circuit trace behind the animated stroke */
  ghostOpacity?: number;
  /** Minimum opacity floor (0–1) for letters during draw/type retraction so text never vanishes */
  minTextOpacity?: number;
}>(), {
  asLink: true,
  showText: true,
  brandText: undefined,
  taglineText: "Smart IoT Solutions",
  animate: true,
  animateIcon: true,
  animateText: true,
  animateTagline: true,
  animateLetters: true,
  letterMode: "wave",
  letterStagger: 55,
  loop: true,
  duration: 4800,
  ghostOpacity: 0.18,
  minTextOpacity: 0.16,
});

const uid = useId();
const gradientId = `nw-grad-${uid}`;
const maskId = `nw-mask-${uid}`;

const { isMotionReduced } = useReduceMotion();

const resolvedBrand = computed(() => props.brandText ?? siteConfig.name ?? "NodeWave");
const brandChars = computed(() => Array.from(resolvedBrand.value));
const taglineChars = computed(() => Array.from(props.taglineText));

const shouldAnimateIcon = computed(
  () => !isMotionReduced.value && props.animate && props.animateIcon,
);

const shouldAnimateBrand = computed(
  () => !isMotionReduced.value && props.animate && props.animateText,
);

const shouldAnimateTagline = computed(
  () => !isMotionReduced.value && props.animate && props.animateTagline,
);

const rootStyles = computed(() => ({
  "--nw-duration": `${props.duration}ms`,
  "--nw-stagger": `${props.letterStagger}ms`,
  "--nw-ghost-opacity": String(props.ghostOpacity),
  "--nw-min-opacity": String(props.minTextOpacity),
}));

function getLetterClass(isActive: boolean) {
  if (!isActive)
    return undefined;

  if (!props.loop) {
    return props.letterMode === "type"
      ? "nw-char-type-once"
      : "nw-char-draw-once";
  }

  switch (props.letterMode) {
    case "draw":
      return "nw-char-draw-loop";
    case "type":
      return "nw-char-type-loop";
    case "wave":
    default:
      return "nw-char-wave-loop";
  }
}

function getLineClass(isActive: boolean) {
  if (!isActive)
    return undefined;
  return props.loop ? "nw-line-loop" : "nw-line-once";
}
</script>

<template>
  <component
    :is="asLink ? resolveComponent('NuxtLink') : 'div'"
    :to="asLink ? '/' : undefined"
    :aria-label="asLink ? `${resolvedBrand} — Return to homepage` : undefined"
    :style="rootStyles"
    class="group/logo inline-flex items-center gap-2.5 sm:gap-3 min-w-0 select-none rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    <!-- Self-Drawing NodeWave Circuit Icon -->
    <div class="relative size-8 sm:size-9 shrink-0 flex items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <!-- Primary Teal-Cyan Brand Gradient -->
          <linearGradient
            :id="gradientId"
            x1="10"
            y1="12"
            x2="110"
            y2="108"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#14b8a6" />
            <stop offset="52%" stop-color="#0d9488" />
            <stop offset="100%" stop-color="#0f766e" />
          </linearGradient>

          <!-- Hollow Pin Cutout Mask -->
          <mask :id="maskId">
            <rect
              x="0"
              y="0"
              width="120"
              height="120"
              fill="white"
            />
            <circle
              cx="26"
              cy="73"
              r="4.2"
              fill="black"
            />
            <circle
              cx="40"
              cy="48"
              r="4.2"
              fill="black"
            />
            <circle
              cx="60"
              cy="56"
              r="4.2"
              fill="black"
            />
            <circle
              cx="108"
              cy="14"
              r="4.2"
              fill="black"
            />
          </mask>
        </defs>

        <!-- Circuit Geometry -->
        <g :mask="`url(#${maskId})`">
          <!-- Persistent Faint Blueprint Underlay (Guarantees Icon Silhouette Never Disappears) -->
          <g v-if="shouldAnimateIcon && ghostOpacity > 0" :style="{ opacity: ghostOpacity }">
            <path
              d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
              :stroke="`url(#${gradientId})`"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 40 48 L 60 12 L 108 108 L 108 14"
              :stroke="`url(#${gradientId})`"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="26"
              cy="73"
              r="5.8"
              fill="none"
              :stroke="`url(#${gradientId})`"
              stroke-width="3.6"
            />
            <circle
              cx="60"
              cy="56"
              r="5.8"
              fill="none"
              :stroke="`url(#${gradientId})`"
              stroke-width="3.6"
            />
            <circle
              cx="40"
              cy="48"
              r="5.8"
              fill="none"
              :stroke="`url(#${gradientId})`"
              stroke-width="3.6"
            />
            <circle
              cx="108"
              cy="14"
              r="5.8"
              fill="none"
              :stroke="`url(#${gradientId})`"
              stroke-width="3.6"
            />
          </g>

          <!-- Active Self-Drawing Trace 1 -->
          <path
            d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
            :stroke="`url(#${gradientId})`"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-trace-1' : 'nw-once-trace-1') : undefined"
          />

          <!-- Active Self-Drawing Trace 2 -->
          <path
            d="M 40 48 L 60 12 L 108 108 L 108 14"
            :stroke="`url(#${gradientId})`"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-trace-2' : 'nw-once-trace-2') : undefined"
          />

          <!-- Active Self-Drawing Terminal Pin Rings -->
          <circle
            cx="26"
            cy="73"
            r="5.8"
            fill="none"
            :stroke="`url(#${gradientId})`"
            stroke-width="3.6"
            stroke-linecap="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-pin-1' : 'nw-once-pin-1') : undefined"
          />
          <circle
            cx="60"
            cy="56"
            r="5.8"
            fill="none"
            :stroke="`url(#${gradientId})`"
            stroke-width="3.6"
            stroke-linecap="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-pin-2' : 'nw-once-pin-2') : undefined"
          />
          <circle
            cx="40"
            cy="48"
            r="5.8"
            fill="none"
            :stroke="`url(#${gradientId})`"
            stroke-width="3.6"
            stroke-linecap="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-pin-3' : 'nw-once-pin-3') : undefined"
          />
          <circle
            cx="108"
            cy="14"
            r="5.8"
            fill="none"
            :stroke="`url(#${gradientId})`"
            stroke-width="3.6"
            stroke-linecap="round"
            pathLength="100"
            :class="shouldAnimateIcon ? (loop ? 'nw-draw-pin-4' : 'nw-once-pin-4') : undefined"
          />
        </g>
      </svg>
    </div>

    <!-- Two-Line Wordmark Beside Icon -->
    <div v-if="showText" class="flex flex-col justify-center min-w-0 leading-none">
      <!-- Line 1: Brand Title -->
      <span
        :aria-label="resolvedBrand"
        class="font-sans text-sm sm:text-base font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover/logo:text-primary-600 dark:group-hover/logo:text-primary-400 transition-colors duration-200 truncate"
        :class="!animateLetters ? getLineClass(shouldAnimateBrand) : undefined"
      >
        <template v-if="animateLetters">
          <span
            v-for="(char, idx) in brandChars"
            :key="`brand-${idx}-${char}`"
            aria-hidden="true"
            class="inline-block will-change-transform"
            :class="getLetterClass(shouldAnimateBrand)"
            :style="{ '--char-index': idx }"
          >{{ char === " " ? "\u00A0" : char }}</span>
        </template>
        <template v-else>
          {{ resolvedBrand }}
        </template>
      </span>

      <!-- Line 2: Tagline -->
      <span
        :aria-label="taglineText"
        class="mt-1 font-mono text-[9px] sm:text-[10px] font-medium tracking-[0.08em] text-neutral-500 dark:text-neutral-400 truncate"
        :class="!animateLetters ? getLineClass(shouldAnimateTagline) : undefined"
      >
        <template v-if="animateLetters">
          <span
            v-for="(char, idx) in taglineChars"
            :key="`tag-${idx}-${char}`"
            aria-hidden="true"
            class="inline-block will-change-transform"
            :class="getLetterClass(shouldAnimateTagline)"
            :style="{ '--char-index': idx + 2 }"
          >{{ char === " " ? "\u00A0" : char }}</span>
        </template>
        <template v-else>
          {{ taglineText }}
        </template>
      </span>
    </div>
  </component>
</template>

<style scoped>
/* =========================================================
   INFINITE ICON LOOP (STARTS DRAWN AT 0% SO NEVER BLANK)
   ========================================================= */
.nw-draw-trace-1 {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  animation: nw-trace-1-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.nw-draw-trace-2 {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  animation: nw-trace-2-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.nw-draw-pin-1,
.nw-draw-pin-2,
.nw-draw-pin-3,
.nw-draw-pin-4,
.nw-once-pin-1,
.nw-once-pin-2,
.nw-once-pin-3,
.nw-once-pin-4 {
  stroke-dasharray: 100;
  transform-box: fill-box;
  transform-origin: center;
  transform: rotate(-90deg);
}

.nw-draw-pin-1 {
  stroke-dashoffset: 0;
  animation: nw-pin-1-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.nw-draw-pin-2 {
  stroke-dashoffset: 0;
  animation: nw-pin-2-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.nw-draw-pin-3 {
  stroke-dashoffset: 0;
  animation: nw-pin-3-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.nw-draw-pin-4 {
  stroke-dashoffset: 0;
  animation: nw-pin-4-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

/* =========================================================
   INDIVIDUAL LETTER ANIMATIONS (INFINITE)
   ========================================================= */
/* Mode 1: Wave — 100% readable at all times with rhythmic teal pulse & lift */
.nw-char-wave-loop {
  animation: nw-char-wave var(--nw-duration, 4800ms) cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: calc(var(--char-index, 0) * var(--nw-stagger, 55ms));
}

/* Mode 2: Draw — Character-by-character clip draw & retract (phase-offset from icon) */
.nw-char-draw-loop {
  animation: nw-char-draw var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite both;
  animation-delay: calc(var(--char-index, 0) * var(--nw-stagger, 55ms));
}

/* Mode 3: Type — Crisp staggered character emergence & retraction */
.nw-char-type-loop {
  animation: nw-char-type var(--nw-duration, 4800ms) cubic-bezier(0.22, 1, 0.36, 1) infinite both;
  animation-delay: calc(var(--char-index, 0) * var(--nw-stagger, 55ms));
}

/* Whole-line fallback loop when :animate-letters="false" */
.nw-line-loop {
  animation: nw-line-reveal-loop var(--nw-duration, 4800ms) cubic-bezier(0.65, 0, 0.35, 1) infinite both;
}

/* =========================================================
   ONE-SHOT ANIMATIONS (WHEN :loop="false")
   ========================================================= */
.nw-once-trace-1 {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: nw-stroke-once 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.08s 1 both;
}

.nw-once-trace-2 {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: nw-stroke-once 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.32s 1 both;
}

.nw-once-pin-1 {
  stroke-dashoffset: 100;
  animation: nw-stroke-once 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0s 1 both;
}

.nw-once-pin-2 {
  stroke-dashoffset: 100;
  animation: nw-stroke-once 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.95s 1 both;
}

.nw-once-pin-3 {
  stroke-dashoffset: 100;
  animation: nw-stroke-once 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.25s 1 both;
}

.nw-once-pin-4 {
  stroke-dashoffset: 100;
  animation: nw-stroke-once 0.45s cubic-bezier(0.22, 1, 0.36, 1) 1.2s 1 both;
}

.nw-char-draw-once {
  animation: nw-char-draw-once 0.55s cubic-bezier(0.22, 1, 0.36, 1) 1 both;
  animation-delay: calc(var(--char-index, 0) * var(--nw-stagger, 55ms));
}

.nw-char-type-once {
  animation: nw-char-type-once 0.45s cubic-bezier(0.22, 1, 0.36, 1) 1 both;
  animation-delay: calc(var(--char-index, 0) * var(--nw-stagger, 55ms));
}

.nw-line-once {
  animation: nw-line-reveal-once 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.15s 1 both;
}

/* =========================================================
   KEYFRAMES
   ========================================================= */
/* Icon traces start at 0 (drawn), retract mid-cycle, and redraw cleanly */
@keyframes nw-trace-1-loop {
  0%,
  26% {
    stroke-dashoffset: 0;
  }
  50%,
  58% {
    stroke-dashoffset: 100;
  }
  84%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-trace-2-loop {
  0%,
  20% {
    stroke-dashoffset: 0;
  }
  44%,
  64% {
    stroke-dashoffset: 100;
  }
  90%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-pin-1-loop {
  0%,
  28% {
    stroke-dashoffset: 0;
  }
  36%,
  56% {
    stroke-dashoffset: 100;
  }
  64%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-pin-2-loop {
  0%,
  24% {
    stroke-dashoffset: 0;
  }
  32%,
  80% {
    stroke-dashoffset: 100;
  }
  88%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-pin-3-loop {
  0%,
  22% {
    stroke-dashoffset: 0;
  }
  30%,
  62% {
    stroke-dashoffset: 100;
  }
  70%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-pin-4-loop {
  0%,
  16% {
    stroke-dashoffset: 0;
  }
  24%,
  86% {
    stroke-dashoffset: 100;
  }
  94%,
  100% {
    stroke-dashoffset: 0;
  }
}

/* Individual Letter Wave: always legible, subtle lift & primary highlight */
@keyframes nw-char-wave {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  12% {
    transform: translateY(-2px);
    color: var(--ui-primary, #14b8a6);
    opacity: 1;
  }
  26% {
    transform: translateY(0);
    opacity: 1;
  }
  65% {
    opacity: 0.85;
  }
}

/* Individual Letter Draw: staggered offset so text is full while icon retracts (26%–84%) */
@keyframes nw-char-draw {
  0%,
  14% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
    transform: translateY(0);
  }
  26%,
  34% {
    clip-path: inset(0 100% 0 0);
    opacity: var(--nw-min-opacity, 0.16);
    transform: translateY(1px);
  }
  48%,
  100% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
    transform: translateY(0);
  }
}

/* Individual Letter Type: crisp pop & settle */
@keyframes nw-char-type {
  0%,
  14% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  26%,
  34% {
    opacity: var(--nw-min-opacity, 0.16);
    transform: translateY(2px) scale(0.94);
  }
  46%,
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes nw-line-reveal-loop {
  0%,
  14% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
  26%,
  34% {
    clip-path: inset(0 100% 0 0);
    opacity: var(--nw-min-opacity, 0.16);
  }
  50%,
  100% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
}

@keyframes nw-stroke-once {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes nw-char-draw-once {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
    transform: translateX(-3px);
  }
  100% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes nw-char-type-once {
  0% {
    opacity: 0;
    transform: translateY(3px) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes nw-line-reveal-once {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
    transform: translateX(-4px);
  }
  100% {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nw-draw-trace-1,
  .nw-draw-trace-2,
  .nw-draw-pin-1,
  .nw-draw-pin-2,
  .nw-draw-pin-3,
  .nw-draw-pin-4,
  .nw-char-wave-loop,
  .nw-char-draw-loop,
  .nw-char-type-loop,
  .nw-line-loop,
  .nw-once-trace-1,
  .nw-once-trace-2,
  .nw-once-pin-1,
  .nw-once-pin-2,
  .nw-once-pin-3,
  .nw-once-pin-4,
  .nw-char-draw-once,
  .nw-char-type-once,
  .nw-line-once {
    animation: none !important;
    stroke-dashoffset: 0 !important;
    clip-path: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
