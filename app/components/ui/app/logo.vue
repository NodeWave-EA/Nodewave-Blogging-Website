<script setup lang="ts">
const name = "NodeWave";
const description = "Smart IoT Solutions";
</script>

<template>
  <NuxtLink
    v-slot="{ navigate }"
    to="/"
    custom
  >
    <div
      role="link"
      tabindex="0"
      class="inline-flex items-center gap-3 cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1"
      :aria-label="`${name} - ${description}`"
      data-aos="fade-left"
      data-aos-duration="500"
      data-aos-easing="ease-out-quad"
      @click="navigate"
      @keydown.enter.prevent="() => navigate()"
      @keydown.space.prevent="() => navigate()"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105"
        data-aos="zoom-in"
        data-aos-delay="50"
      >
        <NuxtImg
          src="/logo.png"
          alt="Nodewave Logo"
          width="32"
          height="32"
          class="size-8 object-contain"
        />
      </div>

      <div
        class="flex flex-col font-mono tracking-wide"
        data-aos="fade-left"
        data-aos-delay="100"
      >
        <span
          class="font-bold tracking-tight whitespace-nowrap text-gray-900 dark:text-gray-100"
          aria-hidden="true"
        >
          {{ name }}
        </span>

        <span
          class="mt-0.5 text-[12px] font-semibold whitespace-nowrap text-gray-600 transition-colors duration-300 group-hover:text-teal-600/80 dark:text-gray-400 dark:group-hover:text-teal-400/80"
          aria-hidden="true"
        >
          {{ description }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
