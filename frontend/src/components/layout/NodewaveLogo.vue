<template>
	<svg v-bind="$attrs" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img"
		:aria-label="ariaLabel" xmlns="http://www.w3.org/2000/svg" :class="['logo-svg', $attrs.class]">
		<title>{{ ariaLabel }}</title>

		<!-- Text brand -->
		<defs>
			<linearGradient :id="gradientId" x1="0" x2="1">
				<stop offset="0%" :stop-color="primaryColor" />
				<stop offset="100%" :stop-color="accentColor" />
			</linearGradient>
		</defs>

		<g transform="translate(0,0)">
			<text ref="textRef" :x="textX" :y="textY" :fill="textColor || ('url(#' + gradientId + ')')" :font-size="fontSize"
				font-weight="700"
				font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial">
				{{ text }}
			</text>

			<g v-if="showWave" transform="translate(0,0)">
				<path :d="wavePath" :fill="waveFill" :opacity="waveOpacity" />
			</g>
		</g>
	</svg>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, ref, watch } from 'vue';
	const props = defineProps({
		text: { type: String, default: 'NodeWave EA' },
		width: { type: Number, default: 240 },
		height: { type: Number, default: 48 },
		primaryColor: { type: String, default: '#0ea5a4' },
		accentColor: { type: String, default: '#6366f1' },
		waveColor: { type: String, default: '#60a5fa' },
		textColor: { type: String, default: '' },
		waveAmplitude: { type: Number, default: 6 },
		waveFrequency: { type: Number, default: 2 },
		waveOpacity: { type: Number, default: 0.18 },
		showWave: { type: Boolean, default: true },
	})

	const { text, width, height, primaryColor, accentColor, waveColor, textColor, waveAmplitude, waveFrequency, waveOpacity, showWave } = props

	// Simple unique id for gradient so multiple logos can be used on same page
	const gradientId = `logo-grad-${Math.random().toString(36).slice(2, 9)}`

	const fontSize = computed(() => Math.round(height * 0.45))
	const textX = computed(() => 8)
	const textY = computed(() => Math.round(height * 0.65))

	// Measure text width so the wave can match the name width
	const textRef = ref<SVGTextElement | null>(null)
	const textWidth = ref(0)

	const measureText = () => {
		if (textRef.value && typeof textRef.value.getBBox === 'function') {
			try {
				const bbox = textRef.value.getBBox()
				textWidth.value = bbox.width
			} catch (e) {
				// getBBox can throw in some SVG-in-foreignObject scenarios; fallback
				textWidth.value = 0
			}
		} else {
			textWidth.value = 0
		}
	}

	onMounted(() => {
		nextTick(measureText)
	})

	watch(() => text, async () => {
		await nextTick()
		measureText()
	})

	// Prefer waveColor for the wave fill; text keeps the gradient
	const waveFill = computed(() => waveColor)

	// Create a smooth wave path that spans the measured text width (or falls back to svg width)
	const wavePath = computed(() => {
		const tw = textWidth.value || Math.max(1, width - textX.value * 2)
		const startX = textX.value
		const segments = Math.max(1, Math.round(waveFrequency * 3))
		const segW = tw / segments
		const baseY = height - Math.max(3, Math.round(height * 0.12))
		const amp = waveAmplitude

		let d = `M ${startX} ${baseY}`

		for (let i = 0; i < segments; i++) {
			const x1 = startX + segW * (i + 0.5)
			const y1 = baseY + (i % 2 === 0 ? -amp : amp)
			const x2 = startX + segW * (i + 1)
			d += ` Q ${x1} ${y1} ${x2} ${baseY}`
		}

		// close and fill down to bottom to create a filled wave only under the text
		d += ` L ${startX + tw} ${height} L ${startX} ${height} Z`
		return d
	})

	const ariaLabel = computed(() => `${text} logo`)
</script>

<style scoped>
	.logo-svg {
		display: inline-block;
		height: auto;
		vertical-align: middle;
	}
</style>
