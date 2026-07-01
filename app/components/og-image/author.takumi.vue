<script setup>
const props = defineProps({
  colorMode: { type: String, required: false, default: "dark" },
  name: { type: String, required: false, default: "Author Name" },
  role: { type: String, required: false, default: "Writer & Developer" },
  avatar: { type: String, required: false },
  articleCount: { type: Number, required: false, default: 0 },
});

const isDark = props.colorMode === "dark";

// Matches the blue-500 badge accent color
const themeColor = "59, 130, 246";
</script>

<template>
  <div class="relative w-full h-full flex flex-col p-12 md:p-16 justify-center items-center bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white overflow-hidden text-center">
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
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${themeColor}, ${isDark ? '0.14' : '0.08'}), transparent 55%)`,
      }"
    />

    <div class="z-10 flex flex-col items-center gap-6">
      <div
        v-if="avatar"
        class="overflow-hidden border-4 border-neutral-300 dark:border-neutral-700"
        style="width: 200px; height: 200px; border-radius: 50%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15);"
      >
        <img
          :src="avatar"
          alt="Avatar"
          class="w-full h-full"
          style="object-fit: cover; border-radius: 50%;"
        >
      </div>

      <h1 class="text-6xl md:text-7xl font-black m-0 tracking-tight text-neutral-900 dark:text-white" style="line-height: 1.15;">
        {{ name }}
      </h1>

      <p class="text-3xl md:text-4xl font-medium text-neutral-600 dark:text-neutral-400">
        {{ role }}
      </p>

      <div
        v-if="articleCount > 0"
        class="mt-4 px-6 py-2.5 text-2xl font-bold text-white bg-blue-500 rounded-full"
        style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2);"
      >
        {{ articleCount }} Published Articles
      </div>
    </div>
  </div>
</template>
