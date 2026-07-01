<script setup>
const props = defineProps({
  colorMode: { type: String, required: false, default: "dark" },
  title: { type: String, required: false, default: "Category Name" },
  description: { type: String, required: false, default: "Explore all articles, tutorials, and news related to this topic." },
  type: { type: String, required: false, default: "Category" }, // Pass 'Tag' or 'Category'
  articleCount: { type: Number, required: false, default: 0 },
});

const isDark = props.colorMode === "dark";

// Matches the indigo-500 badge accent color
const themeColor = "99, 102, 241";
</script>

<template>
  <div class="relative w-full h-full flex flex-col p-12 md:p-16 justify-between bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white overflow-hidden">
    <div
      :style="{
        position: 'absolute',
        inset: '0',
        opacity: isDark ? 0.03 : 0.05,
        backgroundImage: isDark
          ? 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)'
          : 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }"
    />

    <div
      :style="{
        position: 'absolute',
        inset: '0',
        backgroundImage: `radial-gradient(circle at 100% 100%, rgba(${themeColor}, ${isDark ? '0.16' : '0.08'}), transparent 50%), radial-gradient(circle at 0% 0%, rgba(${themeColor}, ${isDark ? '0.1' : '0.05'}), transparent 45%)`,
      }"
    />

    <div class="flex items-start z-10">
      <div class="text-xl md:text-2xl font-bold px-6 py-2.5 text-white bg-indigo-500 rounded-full uppercase tracking-wider">
        {{ type }}
      </div>
    </div>

    <div class="flex flex-col gap-6 max-w-5xl z-10 text-neutral-900 dark:text-white">
      <h1
        class="text-7xl md:text-8xl font-black m-0 tracking-tight"
        style="line-height: 1.1;"
      >
        {{ title }}
      </h1>
      <p class="text-3xl md:text-4xl font-medium text-neutral-700 dark:text-neutral-300">
        {{ description }}
      </p>
    </div>

    <div class="flex items-center z-10">
      <div
        v-if="articleCount > 0"
        class="text-2xl md:text-3xl font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight flex items-center gap-3"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 9H21"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 21V9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ articleCount }} Articles available</span>
      </div>
    </div>
  </div>
</template>
