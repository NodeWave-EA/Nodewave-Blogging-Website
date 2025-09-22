<template>
	<section class="mt-10 text-center">
		<h2 class="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ready to dive in?</h2>
		<p class="text-muted-foreground max-w-2xl mx-auto mb-6">Explore the latest insights on our blog or subscribe to get
			updates straight to your inbox.</p>

		<!-- CTA Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
			<router-link to="/blog"
				class="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto group">
				<BookOpenIcon class="w-5 h-5 transition duration-200 group-hover:scale-110" />
				Explore Blog
			</router-link>

			<button type="button" @click="openNewsletter"
				class="inline-flex items-center gap-2 px-8 py-3 bg-transparent text-foreground font-semibold rounded-lg border border-border hover:bg-muted transition duration-200 w-full sm:w-auto group">
				<EnvelopeIcon class="w-5 h-5 transition duration-200 group-hover:scale-110" />
				Subscribe
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { BookOpenIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';

	const openNewsletter = () => {
		window.dispatchEvent(new CustomEvent('open-newsletter'))
	}
</script>
