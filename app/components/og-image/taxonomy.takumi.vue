<script setup lang="ts">
import { computed } from "vue";

type TaxonomyOgImageProps = {
  brand?: string;
  siteUrl?: string;
  colorMode?: "light" | "dark";
  title?: string;
  description?: string;
  type?: "Category" | "Tag" | string;
  slug?: string;
  accentColor?: string;
  articleCount?: number;
  width?: number;
  height?: number;
};

const props = withDefaults(defineProps<TaxonomyOgImageProps>(), {
  brand: "NodeWave",
  siteUrl: "nodewaveblog.vercel.app",
  colorMode: "dark",
  title: "Category Name",
  description: "Explore all articles, tutorials, and guides curated under this topic.",
  type: "Category",
  slug: "",
  accentColor: "",
  articleCount: 0,
  width: 1200,
  height: 630,
});

const isDark = computed(() => props.colorMode === "dark");
const isTag = computed(() => props.type?.toLowerCase() === "tag");

const palette = computed(() =>
  isDark.value
    ? {
        bg: "#0a1615",
        surface: "#112422",
        border: "#1a3330",
        text: "#fafafa",
        muted: "#d4d4d8",
        subtle: "#a1a1aa",
        primary: "#2dd4bf",
        primarySoft: "rgba(20, 184, 166, 0.14)",
        primaryBorder: "rgba(45, 212, 191, 0.3)",
        gridLine: "rgba(255, 255, 255, 0.035)",
        gradStart: "#2dd4bf",
        gradMid: "#14b8a6",
        gradEnd: "#0d9488",
      }
    : {
        bg: "#eae4d7",
        surface: "#e4ddd0",
        border: "#d5cec0",
        text: "#18181b",
        muted: "#3f3f46",
        subtle: "#52525b",
        primary: "#0d9488",
        primarySoft: "rgba(13, 148, 136, 0.11)",
        primaryBorder: "rgba(13, 148, 136, 0.28)",
        gridLine: "rgba(0, 0, 0, 0.04)",
        gradStart: "#14b8a6",
        gradMid: "#0d9488",
        gradEnd: "#0f766e",
      },
);

const titleFontSize = computed(() => {
  const len = props.title?.length || 0;
  if (len > 42)
    return "44px";
  if (len > 28)
    return "54px";
  if (len > 18)
    return "62px";
  return "68px";
});

const truncatedDescription = computed(() => {
  const text = props.description?.trim() || "";
  if (!text)
    return "";
  return text.length > 170
    ? `${text.slice(0, 167).trimEnd()}...`
    : text;
});

const articleCountLabel = computed(() => {
  const count = Number(props.articleCount) || 0;
  if (count <= 0)
    return "Curated Topic Archive";
  return `${count} ${count === 1
    ? "Published Article"
    : "Published Articles"}`;
});

const cleanHost = computed(() =>
  props.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
);

const archivePath = computed(() => {
  if (!props.slug)
    return "";
  const base = isTag.value ? "/tags" : "/categories";
  return `${base}/${props.slug}`;
});
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
      padding: '44px 56px 38px 56px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Plus Jakarta Sans',
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

    <!-- Theme Grid & Radial Glow Backdrop -->
    <div
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
          backgroundImage: 'radial-gradient(circle at 88% 16%, rgba(20, 184, 166, 0.16), transparent 48%), radial-gradient(circle at 12% 88%, rgba(56, 189, 248, 0.1), transparent 45%)',
        }"
      />
    </div>

    <!-- Top Row: Brand Lockup + Taxonomy Type Badge -->
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
              id="nw-tax-grad"
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

            <mask id="nw-tax-mask">
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

          <g mask="url(#nw-tax-mask)">
            <path
              d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
              stroke="url(#nw-tax-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 40 48 L 60 12 L 108 108 L 108 14"
              stroke="url(#nw-tax-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <circle
              cx="26"
              cy="73"
              r="5.8"
              stroke="url(#nw-tax-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="60"
              cy="56"
              r="5.8"
              stroke="url(#nw-tax-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="40"
              cy="48"
              r="5.8"
              stroke="url(#nw-tax-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="108"
              cy="14"
              r="5.8"
              stroke="url(#nw-tax-grad)"
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

      <!-- Category / Tag Pill Badge -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 15px',
          borderRadius: '4px',
          backgroundColor: palette.primarySoft,
          border: `1px solid ${palette.primaryBorder}`,
          color: palette.primary,
          fontFamily: 'JetBrains Mono',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }"
      >
        <!-- Hash Icon for Tag -->
        <svg
          v-if="isTag"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"
            :stroke="palette.primary"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <!-- Folder Icon for Category -->
        <svg
          v-else
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

        <span>{{ type }} Archive</span>
      </div>
    </div>

    <!-- Center Editorial Block -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '18px',
        maxWidth: '1040px',
        position: 'relative',
        zIndex: 10,
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }"
      >
        <span
          v-if="isTag"
          :style="{
            fontFamily: 'JetBrains Mono',
            fontSize: titleFontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            color: palette.primary,
          }"
        >#</span>

        <h1
          :style="{
            fontFamily: 'Playfair Display',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            margin: 0,
            color: palette.text,
          }"
        >
          {{ title }}
        </h1>
      </div>

      <p
        v-if="truncatedDescription"
        :style="{
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: 1.5,
          margin: 0,
          color: palette.muted,
          maxWidth: '940px',
        }"
      >
        {{ truncatedDescription }}
      </p>
    </div>

    <!-- Bottom Metadata Strip -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '18px',
        borderTop: `1px solid ${palette.border}`,
        position: 'relative',
        zIndex: 10,
        fontFamily: 'JetBrains Mono',
        fontSize: '13px',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: palette.text,
          fontWeight: 600,
        }"
      >
        <span
          :style="{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: accentColor || palette.primary,
          }"
        />
        <span>{{ cleanHost }}{{ archivePath }}</span>
      </div>

      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          borderRadius: '4px',
          backgroundColor: palette.primarySoft,
          border: `1px solid ${palette.primaryBorder}`,
          color: palette.primary,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.08em',
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
            d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
            :stroke="palette.primary"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ articleCountLabel }}</span>
      </div>
    </div>
  </div>
</template>
