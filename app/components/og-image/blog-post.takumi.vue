<script setup lang="ts">
import { computed } from "vue";

type BlogOgImageProps = {
  brand?: string;
  siteUrl?: string;
  colorMode?: "light" | "dark";
  title?: string;
  description?: string;
  author?: string;
  authorTitle?: string;
  date?: string;
  updatedDate?: string;
  readingTime?: string;
  wordCount?: string;
  category?: string;
  tags?: string[] | string;
  featured?: boolean;
  avatar?: string;
  backgroundImage?: string;
  width?: number;
  height?: number;
};

const props = withDefaults(defineProps<BlogOgImageProps>(), {
  brand: "NodeWave",
  siteUrl: "nodewaveblog.vercel.app",
  colorMode: "dark",
  title: "Blog Post Title",
  description: "",
  author: "NodeWave Editorial",
  authorTitle: "",
  date: "",
  updatedDate: "",
  readingTime: "5 min read",
  wordCount: "",
  category: "Engineering",
  tags: () => [],
  featured: false,
  avatar: undefined,
  backgroundImage: undefined,
  width: 1200,
  height: 630,
});

const isDark = computed(() => props.colorMode === "dark");

const palette = computed(() =>
  isDark.value
    ? {
        bg: "#0a1615",
        surface: "#112422",
        surfaceElevated: "rgba(17, 36, 34, 0.85)",
        border: "#1a3330",
        text: "#fafafa",
        muted: "#d4d4d8",
        subtle: "#a1a1aa",
        primary: "#2dd4bf",
        primarySoft: "rgba(20, 184, 166, 0.14)",
        primaryBorder: "rgba(45, 212, 191, 0.3)",
        amber: "#fbbf24",
        amberSoft: "rgba(245, 158, 11, 0.14)",
        amberBorder: "rgba(245, 158, 11, 0.32)",
        gridLine: "rgba(255, 255, 255, 0.035)",
        scrimGradient:
        "linear-gradient(105deg, rgba(10, 22, 21, 0.96) 0%, rgba(10, 22, 21, 0.92) 60%, rgba(10, 22, 21, 0.84) 100%)",
        gradStart: "#2dd4bf",
        gradMid: "#14b8a6",
        gradEnd: "#0d9488",
      }
    : {
        bg: "#eae4d7",
        surface: "#e4ddd0",
        surfaceElevated: "rgba(228, 221, 208, 0.85)",
        border: "#d5cec0",
        text: "#18181b",
        muted: "#3f3f46",
        subtle: "#52525b",
        primary: "#0d9488",
        primarySoft: "rgba(13, 148, 136, 0.11)",
        primaryBorder: "rgba(13, 148, 136, 0.28)",
        amber: "#b45309",
        amberSoft: "rgba(245, 158, 11, 0.14)",
        amberBorder: "rgba(217, 119, 6, 0.3)",
        gridLine: "rgba(0, 0, 0, 0.04)",
        scrimGradient:
        "linear-gradient(105deg, rgba(234, 228, 215, 0.96) 0%, rgba(234, 228, 215, 0.92) 60%, rgba(234, 228, 215, 0.85) 100%)",
        gradStart: "#14b8a6",
        gradMid: "#0d9488",
        gradEnd: "#0f766e",
      },
);

const titleFontSize = computed(() => {
  const len = props.title?.length || 0;
  if (len > 90)
    return "40px";
  if (len > 65)
    return "46px";
  if (len > 42)
    return "52px";
  return "58px";
});

const truncatedDescription = computed(() => {
  const text = props.description?.trim() || "";
  if (!text)
    return "";
  return text.length > 145
    ? `${text.slice(0, 142).trimEnd()}...`
    : text;
});

const allTags = computed(() => {
  if (!props.tags)
    return [];
  return Array.isArray(props.tags)
    ? props.tags.filter(Boolean)
    : String(props.tags)
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
});

const visibleTags = computed(() => allTags.value.slice(0, 3));
const remainingTagsCount = computed(() => Math.max(0, allTags.value.length - 3));

const cleanHost = computed(() =>
  props.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
);

const authorInitial = computed(() =>
  (props.author?.trim().charAt(0) || "N").toUpperCase(),
);
</script>

<template>
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: palette.bg,
      color: palette.text,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '40px 56px 36px 56px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '\'Plus Jakarta Sans\', system-ui, sans-serif',
      boxSizing: 'border-box',
    }"
  >
    <!-- Top Brand Accent Bar -->
    <div
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '4px',
        backgroundImage: 'linear-gradient(90deg, #14b8a6 0%, #34d399 50%, #38bdf8 100%)',
        zIndex: 20,
      }"
    />

    <!-- Cover Image Layer + Directional Contrast Scrim -->
    <div
      v-if="backgroundImage"
      :style="{
        position: 'absolute',
        inset: '0',
        display: 'flex',
      }"
    >
      <img
        :src="backgroundImage"
        alt=""
        :style="{
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }"
      >
      <div
        :style="{
          position: 'absolute',
          inset: '0',
          backgroundImage: palette.scrimGradient,
        }"
      />
    </div>

    <!-- Fallback Theme Grid & Radial Glow Backdrop -->
    <div
      v-else
      :style="{
        position: 'absolute',
        inset: '0',
        display: 'flex',
      }"
    >
      <div
        :style="{
          position: 'absolute',
          inset: '0',
          backgroundImage: `linear-gradient(to right, ${palette.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${palette.gridLine} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }"
      />
      <div
        :style="{
          position: 'absolute',
          inset: '0',
          backgroundImage: 'radial-gradient(circle at 90% 14%, rgba(20, 184, 166, 0.16), transparent 48%), radial-gradient(circle at 10% 90%, rgba(56, 189, 248, 0.1), transparent 45%)',
        }"
      />
    </div>

    <!-- Top Row: Brand Lockup + Featured & Category Badges -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        zIndex: 10,
      }"
    >
      <!-- NodeWave Circuit Emblem + Wordmark -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }"
      >
        <svg
          width="42"
          height="42"
          viewBox="4 4 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="nw-blog-grad"
              x1="10"
              y1="12"
              x2="110"
              y2="108"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" :stop-color="palette.gradStart" />
              <stop offset="52%" :stop-color="palette.gradMid" />
              <stop offset="100%" :stop-color="palette.gradEnd" />
            </linearGradient>

            <mask id="nw-blog-mask">
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

          <g mask="url(#nw-blog-mask)">
            <path
              d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
              stroke="url(#nw-blog-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 40 48 L 60 12 L 108 108 L 108 14"
              stroke="url(#nw-blog-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <circle
              cx="26"
              cy="73"
              r="5.8"
              stroke="url(#nw-blog-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="60"
              cy="56"
              r="5.8"
              stroke="url(#nw-blog-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="40"
              cy="48"
              r="5.8"
              stroke="url(#nw-blog-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="108"
              cy="14"
              r="5.8"
              stroke="url(#nw-blog-grad)"
              stroke-width="3.6"
            />
          </g>
        </svg>

        <span
          :style="{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: palette.text,
          }"
        >
          {{ brand }}
        </span>
      </div>

      <!-- Featured & Category Badges -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }"
      >
        <div
          v-if="featured"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '4px',
            backgroundColor: palette.amberSoft,
            border: `1px solid ${palette.amberBorder}`,
            color: palette.amber,
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
              :stroke="palette.amber"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
          <span>Featured</span>
        </div>

        <div
          v-if="category"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 15px',
            borderRadius: '4px',
            backgroundColor: palette.primarySoft,
            border: `1px solid ${palette.primaryBorder}`,
            color: palette.primary,
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
              :stroke="palette.primary"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ category }}</span>
        </div>
      </div>
    </div>

    <!-- Middle Row: Article Title, Excerpt & Topic Tags -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '14px',
        maxWidth: '1060px',
        position: 'relative',
        zIndex: 10,
      }"
    >
      <h1
        :style="{
          fontFamily: '\'Playfair Display\', Georgia, serif',
          fontSize: titleFontSize,
          fontWeight: 700,
          lineHeight: 1.14,
          letterSpacing: '-0.025em',
          margin: 0,
          color: palette.text,
        }"
      >
        {{ title }}
      </h1>

      <p
        v-if="truncatedDescription"
        :style="{
          fontSize: '19px',
          fontWeight: 400,
          lineHeight: 1.48,
          margin: 0,
          color: palette.muted,
          maxWidth: '940px',
        }"
      >
        {{ truncatedDescription }}
      </p>

      <!-- Topic Tags Row -->
      <div
        v-if="visibleTags.length > 0"
        :style="{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '4px',
        }"
      >
        <div
          v-for="tag in visibleTags"
          :key="tag"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: palette.surfaceElevated,
            border: `1px solid ${palette.border}`,
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '13px',
            fontWeight: 600,
            color: palette.muted,
          }"
        >
          <span :style="{ color: palette.primary, fontWeight: 700 }">#</span>
          <span>{{ tag }}</span>
        </div>

        <div
          v-if="remainingTagsCount > 0"
          :style="{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 9px',
            borderRadius: '4px',
            backgroundColor: palette.surfaceElevated,
            border: `1px solid ${palette.border}`,
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '12px',
            fontWeight: 600,
            color: palette.subtle,
          }"
        >
          +{{ remainingTagsCount }}
        </div>
      </div>
    </div>

    <!-- Bottom Row: Author Details, Publication Meta & Host -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        paddingTop: '18px',
        borderTop: `1px solid ${palette.border}`,
        position: 'relative',
        zIndex: 10,
      }"
    >
      <!-- Author + Date, Updated, Reading Time & Word Count -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }"
      >
        <div
          v-if="avatar"
          :style="{
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: `2px solid ${palette.primaryBorder}`,
            backgroundColor: palette.surface,
            flexShrink: 0,
            display: 'flex',
          }"
        >
          <img
            :src="avatar"
            alt=""
            :style="{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }"
          >
        </div>

        <div
          v-else-if="author"
          :style="{
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            border: `2px solid ${palette.primaryBorder}`,
            backgroundColor: palette.surface,
            color: palette.primary,
            fontSize: '22px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }"
        >
          {{ authorInitial }}
        </div>

        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }"
        >
          <!-- Author Name + Role -->
          <div
            v-if="author"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }"
          >
            <span
              :style="{
                fontSize: '20px',
                fontWeight: 700,
                color: palette.text,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }"
            >
              {{ author }}
            </span>

            <span
              v-if="authorTitle"
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '13px',
                fontWeight: 500,
                color: palette.subtle,
              }"
            >
              · {{ authorTitle }}
            </span>
          </div>

          <!-- Date, Updated Date, Reading Time & Word Count -->
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: '\'JetBrains Mono\', monospace',
              fontSize: '14px',
              fontWeight: 500,
              color: palette.muted,
            }"
          >
            <!-- Published Date -->
            <div
              v-if="date"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  :stroke="palette.primary"
                  stroke-width="2"
                />
                <path
                  d="M16 2v4M8 2v4M3 10h18"
                  :stroke="palette.primary"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>{{ date }}</span>
            </div>

            <!-- Updated Date -->
            <div
              v-if="updatedDate"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: palette.subtle,
              }"
            >
              <span :style="{ color: palette.primary, fontWeight: 700 }">•</span>
              <span>Updated {{ updatedDate }}</span>
            </div>

            <!-- Reading Time & Word Count -->
            <div
              v-if="readingTime"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }"
            >
              <span
                v-if="date || updatedDate"
                :style="{ color: palette.primary, fontWeight: 700 }"
              >•</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  :stroke="palette.primary"
                  stroke-width="2"
                />
                <path
                  d="M12 6v6l4 2"
                  :stroke="palette.primary"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>{{ readingTime }}</span>
              <span
                v-if="wordCount"
                :style="{ color: palette.subtle }"
              >({{ wordCount }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Site Host Indicator -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: '\'JetBrains Mono\', monospace',
          fontSize: '13px',
          fontWeight: 600,
          color: palette.text,
        }"
      >
        <span
          :style="{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: palette.primary,
          }"
        />
        <span>{{ cleanHost }}</span>
      </div>
    </div>
  </div>
</template>
