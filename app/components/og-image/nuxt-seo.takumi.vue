<script setup lang="ts">
import { computed } from "vue";

type OgImageProps = {
  brand?: string;
  tagline?: string;
  badge?: string;
  siteUrl?: string;
  colorMode?: "light" | "dark";
  bgImage?: string | null;
  title?: string;
  description?: string;
  isPro?: boolean;
  width?: number;
  height?: number;
};

const props = withDefaults(defineProps<OgImageProps>(), {
  brand: "NodeWave",
  tagline: "Smart IoT Solutions",
  badge: "Curated Posts & Insights",
  siteUrl: "nodewaveblog.vercel.app",
  colorMode: "dark",
  title: "Explore the latest curated posts and insights from NodeWave.",
  description:
    "Technical articles, software architecture guides, and engineering insights.",
  bgImage: null,
  isPro: true,
  width: 1200,
  height: 630,
});

const isDark = computed(() => props.colorMode === "dark");

const palette = computed(() =>
  isDark.value
    ? {
        bg: "#0a1615",
        surface: "#112422",
        border: "#1a3330",
        text: "#fafafa",
        muted: "#a1a1aa",
        subtle: "#71717a",
        primary: "#2dd4bf",
        primarySoft: "rgba(20, 184, 166, 0.12)",
        primaryBorder: "rgba(45, 212, 191, 0.28)",
        gridLine: "rgba(255, 255, 255, 0.035)",
        overlay: "rgba(10, 22, 21, 0.88)",
        gradStart: "#2dd4bf",
        gradMid: "#14b8a6",
        gradEnd: "#0d9488",
      }
    : {
        bg: "#eae4d7",
        surface: "#e4ddd0",
        border: "#d5cec0",
        text: "#18181b",
        muted: "#52525b",
        subtle: "#71717a",
        primary: "#0d9488",
        primarySoft: "rgba(13, 148, 136, 0.1)",
        primaryBorder: "rgba(13, 148, 136, 0.26)",
        gridLine: "rgba(0, 0, 0, 0.04)",
        overlay: "rgba(234, 228, 215, 0.9)",
        gradStart: "#14b8a6",
        gradMid: "#0d9488",
        gradEnd: "#0f766e",
      },
);

const titleFontSize = computed(() => {
  const len = props.title?.length || 0;
  if (len > 85)
    return "44px";
  if (len > 60)
    return "52px";
  return "60px";
});

const cleanHost = computed(() =>
  props.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
);

const year = new Date().getFullYear();
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
      padding: '48px 56px 40px 56px',
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

    <!-- Optional Background Image Layer -->
    <div
      v-if="bgImage"
      :style="{
        position: 'absolute',
        inset: '0',
        display: 'flex',
      }"
    >
      <img
        :src="bgImage"
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
          backgroundColor: palette.overlay,
        }"
      />
    </div>

    <!-- Theme Grid & Radial Glow Backdrop -->
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
          backgroundImage: 'radial-gradient(circle at 88% 15%, rgba(20, 184, 166, 0.16), transparent 48%), radial-gradient(circle at 12% 90%, rgba(56, 189, 248, 0.1), transparent 45%)',
        }"
      />
    </div>

    <!-- Top Header Row: NodeWave Circuit Logo + Hero Pill Badge -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        position: 'relative',
        zIndex: 10,
      }"
    >
      <!-- NodeWave Circuit Emblem & Two-Line Wordmark -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }"
      >
        <svg
          width="60"
          height="60"
          viewBox="4 4 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="nw-og-grad"
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

            <mask id="nw-og-mask">
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

          <g mask="url(#nw-og-mask)">
            <path
              d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
              stroke="url(#nw-og-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 40 48 L 60 12 L 108 108 L 108 14"
              stroke="url(#nw-og-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <circle
              cx="26"
              cy="73"
              r="5.8"
              stroke="url(#nw-og-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="60"
              cy="56"
              r="5.8"
              stroke="url(#nw-og-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="40"
              cy="48"
              r="5.8"
              stroke="url(#nw-og-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="108"
              cy="14"
              r="5.8"
              stroke="url(#nw-og-grad)"
              stroke-width="3.6"
            />
          </g>
        </svg>

        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }"
        >
          <span
            :style="{
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: palette.text,
              lineHeight: 1.05,
            }"
          >
            {{ brand }}
          </span>
          <span
            v-if="tagline"
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: palette.muted,
            }"
          >
            {{ tagline }}
          </span>
        </div>
      </div>

      <!-- Hero Pill Badge -->
      <div
        v-if="badge"
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '9999px',
          backgroundColor: palette.primarySoft,
          border: `1px solid ${palette.primaryBorder}`,
          color: palette.primary,
          fontFamily: '\'JetBrains Mono\', monospace',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.18em',
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
            d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
            :stroke="palette.primary"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ badge }}</span>
      </div>
    </div>

    <!-- Center Editorial Block -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '18px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1040px',
        marginTop: '8px',
        marginBottom: '8px',
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
        v-if="description"
        :style="{
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: 1.5,
          margin: 0,
          color: palette.muted,
          maxWidth: '940px',
        }"
      >
        {{ description }}
      </p>
    </div>

    <!-- Bottom Metadata Strip -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '20px',
        borderTop: `1px solid ${palette.border}`,
        position: 'relative',
        zIndex: 10,
        fontFamily: '\'JetBrains Mono\', monospace',
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
            backgroundColor: palette.primary,
          }"
        />
        <span>{{ cleanHost }}</span>
      </div>

      <span
        :style="{
          color: palette.subtle,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: '12px',
          fontWeight: 600,
        }"
      >
        © {{ year }} {{ brand }} · Ecosystem Insights
      </span>
    </div>
  </div>
</template>
