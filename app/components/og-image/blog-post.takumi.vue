<script setup>
defineProps({
  title: { type: String, required: true, default: "How to Pull and Update All Local Git Branches Safely" },
  description: { type: String, required: false },
  category: { type: String, required: false, default: "Terminal and Shells" },
  author: { type: String, required: false, default: "Gideon Yebei" },
  avatar: { type: String, required: false },
  date: { type: String, required: false, default: "2026-06-26" },
  readingTime: { type: String, required: false, default: "4 min read" },
  backgroundImage: { type: String, required: false },
  siteName: { type: String, required: false, default: "yourdomain.com" },
  siteLogo: { type: String, required: false },
});
</script>

<template>
  <!-- Fixed 1200x630 OG Canvas -->
  <div class="relative w-[1200px] h-[630px] flex flex-col justify-between p-12 bg-neutral-950 text-white font-sans overflow-hidden">
    
    <!-- 1. Background Image + Contrast Protection Overlay -->
    <template v-if="backgroundImage">
      <img
        :src="backgroundImage"
        class="absolute inset-0 w-full h-full object-cover filter blur-[3px] scale-105"
        alt="Background"
      />
      <!-- Gradient overlay ensures white text is always readable -->
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/50" />
    </template>

    <!-- Fallback Gradient (Used if no background image is provided) -->
    <div
      v-else
      class="absolute inset-0 bg-gradient-to-br from-blue-950 via-neutral-950 to-purple-950"
    />

    <!-- Subtle Inner Border Frame -->
    <div class="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none z-20" />

    <!-- 2. Header Row: Category Badge + Site Branding -->
    <div class="flex items-center justify-between z-10">
      <div
        v-if="category"
        class="flex items-center px-5 py-2 rounded-full bg-blue-600 text-white text-lg font-bold shadow-lg border border-blue-400/30"
      >
        <span>{{ category }}</span>
      </div>
      <div v-else />

      <!-- Site Brand Name & Logo -->
      <div v-if="siteName" class="flex items-center gap-3 text-neutral-300 font-semibold text-xl tracking-wide">
        <img v-if="siteLogo" :src="siteLogo" class="w-7 h-7 rounded" alt="Logo" />
        <span>{{ siteName }}</span>
      </div>
    </div>

    <!-- 3. Middle Content Row: Main Title & Optional Excerpt -->
    <div class="flex flex-col gap-4 max-w-[1050px] my-auto z-10">
      <h1 class="text-5xl font-black text-white leading-[1.15] tracking-tight drop-shadow-md">
        {{ title }}
      </h1>
      <p v-if="description" class="text-2xl text-neutral-300 font-medium line-clamp-2 leading-relaxed">
        {{ description }}
      </p>
    </div>

    <!-- 4. Footer Row: Author Profile & Metadata -->
    <div class="flex items-center justify-between z-10 pt-6 border-t border-white/15">
      <div class="flex items-center gap-5">
        <img
          v-if="avatar"
          :src="avatar"
          alt="Avatar"
          class="w-16 h-16 rounded-full border-2 border-blue-500/60 object-cover shadow-md"
        />
        <div class="flex flex-col gap-1">
          <span class="text-2xl font-bold text-white tracking-tight">
            {{ author }}
          </span>
          <div class="flex items-center gap-3 text-lg text-neutral-300 font-medium tracking-tight">
            <span v-if="date">{{ date }}</span>
            <span v-if="date && readingTime">•</span>
            <span v-if="readingTime">{{ readingTime }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
