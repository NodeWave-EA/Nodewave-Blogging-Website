<script setup lang="ts">
type OgImageProps = {
  brand?: string;
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
  colorMode: "dark",
  title: "Insights for Connected Systems",
  bgImage: null,
  isPro: true,
  width: 1200,
  height: 600,
});

const isDark = props.colorMode === "dark";

const themeColor = props.isPro ? "14, 165, 233" : "124, 58, 237";

const year = 2026;

const logo = "https://nodewave.net/preview.png";
</script>

<template>
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: isDark ? '#09090b' : '#ffffff',
      color: isDark ? '#f4f4f5' : '#18181b',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      position: 'relative',
    }"
  >
    <!-- BACKGROUND IMAGE LAYER -->
    <div
      v-if="bgImage"
      :style="{
        position: 'absolute',
        inset: '0',
      }"
    >
      <img
        :src="bgImage"
        alt="Background"
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
          backgroundColor: isDark
            ? 'rgba(9, 9, 11, 0.85)'
            : 'rgba(255, 255, 255, 0.88)',
        }"
      />
    </div>

    <!-- FALLBACK BACKGROUND -->
    <div v-else>
      <div
        :style="{
          position: 'absolute',
          inset: '0',
          opacity: 0.03,
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
          backgroundImage: `radial-gradient(circle at 100% 100%, rgba(${themeColor}, 0.16), transparent 50%),radial-gradient(circle at 0% 0%, rgba(${themeColor}, 0.1), transparent 45%)`,
        }"
      />
    </div>

    <!-- CONTENT -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        flex: 1,
      }"
    >
      <!-- HEADER -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }"
      >
        <div
          :style="{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDark
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(10px)',
          }"
        >
          <img
            :src="logo"
            alt="Logo"
            :style="{
              width: '28px',
              height: '28px',
              objectFit: 'contain',
            }"
          >
        </div>

        <div
          :style="{
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: isDark ? '#fff' : '#000',
          }"
        >
          {{ brand }}
        </div>
      </div>

      <!-- TITLE -->
      <div
        :style="{
          maxWidth: '1000px',
        }"
      >
        <h1
          :style="{
            fontSize: '64px',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: 0,
            color: isDark ? '#fff' : '#09090b',
          }"
        >
          {{ title }}
        </h1>
      </div>

      <!-- DESCRIPTION -->
      <div
        v-if="description"
        :style="{
          marginTop: '16px',
          maxWidth: '800px',
        }"
      >
        <p
          :style="{
            fontSize: '24px',
            lineHeight: 1.5,
            margin: 0,
            color: isDark ? '#a1a1aa' : '#52525b',
          }"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <!-- FOOTER -->
    <div
      :style="{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '24px',
        borderTop: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.05)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: isDark ? '#52525b' : '#a1a1aa',
      }"
    >
      © {{ year }} {{ brand }}. Ecosystem Insights.
    </div>
  </div>
</template>
