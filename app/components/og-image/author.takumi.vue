<script setup lang="ts">
import { computed } from "vue";

type AuthorOgImageProps = {
  brand?: string;
  siteUrl?: string;
  colorMode?: "light" | "dark";
  name?: string;
  role?: string;
  companyName?: string;
  companyRole?: string;
  bio?: string;
  slug?: string;
  avatar?: string;
  articleCount?: number;
  width?: number;
  height?: number;
};

const props = withDefaults(defineProps<AuthorOgImageProps>(), {
  brand: "NodeWave",
  siteUrl: "nodewaveblog.vercel.app",
  colorMode: "dark",
  name: "Author Name",
  role: "Writer & Developer",
  companyName: "",
  companyRole: "",
  bio: "",
  slug: "",
  avatar: undefined,
  articleCount: 0,
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
        gridLine: "rgba(255, 255, 255, 0.035)",
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
        gridLine: "rgba(0, 0, 0, 0.04)",
        gradStart: "#14b8a6",
        gradMid: "#0d9488",
        gradEnd: "#0f766e",
      },
);

const nameFontSize = computed(() => {
  const len = props.name?.length || 0;
  if (len > 28)
    return "44px";
  if (len > 20)
    return "52px";
  return "60px";
});

const truncatedBio = computed(() => {
  const text = props.bio?.trim() || "";
  if (!text)
    return "";
  return text.length > 165
    ? `${text.slice(0, 162).trimEnd()}...`
    : text;
});

const companyLabel = computed(() => {
  if (!props.companyName)
    return "";
  return props.companyRole
    ? `${props.companyRole} @ ${props.companyName}`
    : props.companyName;
});

const articleCountLabel = computed(() => {
  const count = Number(props.articleCount) || 0;
  if (count <= 0)
    return "";
  return `${count} ${count === 1
    ? "Published Article"
    : "Published Articles"}`;
});

const cleanHost = computed(() =>
  props.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
);

const authorInitial = computed(() =>
  (props.name?.trim().charAt(0) || "N").toUpperCase(),
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
      padding: '42px 56px 36px 56px',
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
          backgroundImage: 'radial-gradient(circle at 18% 48%, rgba(20, 184, 166, 0.16), transparent 46%), radial-gradient(circle at 90% 15%, rgba(56, 189, 248, 0.1), transparent 45%)',
        }"
      />
    </div>

    <!-- Top Row: Brand Lockup + Contributor Badge -->
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
              id="nw-author-grad"
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

            <mask id="nw-author-mask">
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

          <g mask="url(#nw-author-mask)">
            <path
              d="M 26 73 L 12 108 L 12 12 L 60 108 L 60 56"
              stroke="url(#nw-author-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 40 48 L 60 12 L 108 108 L 108 14"
              stroke="url(#nw-author-grad)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <circle
              cx="26"
              cy="73"
              r="5.8"
              stroke="url(#nw-author-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="60"
              cy="56"
              r="5.8"
              stroke="url(#nw-author-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="40"
              cy="48"
              r="5.8"
              stroke="url(#nw-author-grad)"
              stroke-width="3.6"
            />
            <circle
              cx="108"
              cy="14"
              r="5.8"
              stroke="url(#nw-author-grad)"
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

      <!-- Contributor Profile Badge -->
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
          fontFamily: '\'JetBrains Mono\', monospace',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.16em',
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
          <circle
            cx="12"
            cy="8"
            r="4"
            :stroke="palette.primary"
            stroke-width="2"
          />
          <path
            d="M4 20c1.8-3.6 4.8-5.4 8-5.4s6.2 1.8 8 5.4"
            :stroke="palette.primary"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span>Contributor Profile</span>
      </div>
    </div>

    <!-- Center Profile Spotlight -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
        position: 'relative',
        zIndex: 10,
      }"
    >
      <!-- Framed Circular Avatar -->
      <div
        :style="{
          width: '176px',
          height: '176px',
          borderRadius: '9999px',
          padding: '6px',
          backgroundColor: palette.surface,
          border: `2px solid ${palette.primaryBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }"
      >
        <div
          v-if="avatar"
          :style="{
            width: '100%',
            height: '100%',
            borderRadius: '9999px',
            overflow: 'hidden',
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
          v-else
          :style="{
            width: '100%',
            height: '100%',
            borderRadius: '9999px',
            backgroundColor: palette.bg,
            color: palette.primary,
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '64px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }"
        >
          {{ authorInitial }}
        </div>
      </div>

      <!-- Author Name, Role, Company & Bio -->
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
          minWidth: 0,
        }"
      >
        <h1
          :style="{
            fontFamily: '\'Playfair Display\', Georgia, serif',
            fontSize: nameFontSize,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            margin: 0,
            color: palette.text,
          }"
        >
          {{ name }}
        </h1>

        <!-- Role + Company Lockup -->
        <div
          :style="{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontFamily: '\'JetBrains Mono\', monospace',
            fontSize: '18px',
            fontWeight: 600,
          }"
        >
          <span
            v-if="role"
            :style="{ color: palette.primary }"
          >
            {{ role }}
          </span>

          <span
            v-if="role && companyLabel"
            :style="{ color: palette.subtle }"
          >•</span>

          <div
            v-if="companyLabel"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '4px',
              backgroundColor: palette.surfaceElevated,
              border: `1px solid ${palette.border}`,
              fontSize: '15px',
              color: palette.muted,
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
                y="7"
                width="18"
                height="13"
                rx="2"
                :stroke="palette.primary"
                stroke-width="2"
              />
              <path
                d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                :stroke="palette.primary"
                stroke-width="2"
              />
            </svg>
            <span>{{ companyLabel }}</span>
          </div>
        </div>

        <!-- Bio Excerpt -->
        <p
          v-if="truncatedBio"
          :style="{
            fontSize: '19px',
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
            color: palette.muted,
            maxWidth: '820px',
          }"
        >
          {{ truncatedBio }}
        </p>
      </div>
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
        <span>{{ cleanHost }}{{ slug ? `/authors/${slug}` : '' }}</span>
      </div>

      <div
        v-if="articleCountLabel"
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
