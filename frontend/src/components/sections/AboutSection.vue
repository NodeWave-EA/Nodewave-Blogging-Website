<template>
	<section class="py-20">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
				{{ siteName }}
			</h2>
			<p class="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
				{{ siteDescription }}
			</p>
			<div class="flex flex-col md:flex-row gap-8 justify-center items-center mt-8">
				<div class="rounded-xl shadow-lg p-8 w-full md:w-1/3">
					<h3 class="text-xl font-semibold mb-2 text-primary">Our Mission</h3>
					<p class="text-muted-foreground text-base">
						{{ missionStatement || 'Empowering readers with actionable knowledge and inspiration for the digital age.' }}
					</p>
				</div>
				<div class="rounded-xl shadow-lg p-8 w-full md:w-1/3">
					<h3 class="text-xl font-semibold mb-2 text-primary">Our Vision</h3>
					<p class="text-muted-foreground text-base">
						{{ visionStatement || 'Empowering readers with actionable knowledge and inspiration for the digital age.' }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { useCompanyInfo } from '@/composables/useCompanyInfo';
	const { siteName, siteDescription, missionStatement, visionStatement } = useCompanyInfo();
</script>
