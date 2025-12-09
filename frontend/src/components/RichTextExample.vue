<!-- 
  Example usage of the RichText component in a blog post view
  Place this in: src/views/Blog/[slug].vue or any other view
-->

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <!-- Post Header -->
    <article v-if="post" class="space-y-8">
      <!-- Title -->
      <header class="space-y-4">
        <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
          {{ post.attributes.title }}
        </h1>

        <!-- Meta info -->
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <time :datetime="post.attributes.publishedAt">
            {{ formatDate(post.attributes.publishedAt) }}
          </time>
          <span>•</span>
          <span>{{ readingTime }} min read</span>
          <span>•</span>
          <span>{{ wordCount }} words</span>
        </div>
      </header>

      <!-- Featured Image -->
      <figure v-if="post.attributes.featuredImage" class="overflow-hidden rounded-lg">
        <img
          :src="getFeaturedImageUrl()"
          :alt="post.attributes.title"
          class="h-96 w-full object-cover"
          loading="eager"
        />
      </figure>

      <!-- Rich Text Content -->
      <RichText
        :content="post.attributes.content"
        class="prose prose-lg lg:prose-xl dark:prose-invert"
        :allow-iframes="true"
        :lazy-images="true"
        @rendered="handleRendered"
        @error="handleError"
      />

      <!-- Tags -->
      <footer v-if="post.attributes.tags?.data" class="border-t border-border pt-8">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.attributes.tags.data"
            :key="tag.id"
            class="rounded-full bg-muted px-3 py-1 text-sm"
          >
            {{ tag.attributes.name }}
          </span>
        </div>
      </footer>
    </article>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
      ></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-6">
      <p class="text-destructive">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RichText from '@/components/RichText.vue'
import { resolveStrapiMedia } from '@/utils/strapiMedia'

// Mock post data - replace with actual API call
interface Post {
  id: number
  attributes: {
    title: string
    content: string
    publishedAt: string
    featuredImage?: {
      data?: {
        attributes?: {
          url: string
        }
      }
    }
    tags?: {
      data: Array<{
        id: number
        attributes: {
          name: string
        }
      }>
    }
  }
}

const post = ref<Post | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const readingTime = ref(0)
const wordCount = ref(0)

// Format date helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get featured image URL
const getFeaturedImageUrl = () => {
  if (!post.value?.attributes?.featuredImage?.data?.attributes?.url) {
    return ''
  }
  return resolveStrapiMedia(post.value.attributes.featuredImage.data.attributes.url)
}

// Handle render success
const handleRendered = (result: { html: string; wordCount: number; readingTime: number }) => {
  readingTime.value = result.readingTime
  wordCount.value = result.wordCount
  console.log('Content rendered successfully:', result)
}

// Handle render error
const handleError = (errorMessage: string) => {
  console.error('Failed to render content:', errorMessage)
  error.value = errorMessage
}

// Load post data (replace with actual API call)
const loadPost = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/blog-posts/${route.params.slug}`)
    // post.value = await response.json()

    // Example mock data
    post.value = {
      id: 1,
      attributes: {
        title: 'Getting Started with Vue 3 and TypeScript',
        content: `
# Introduction

This is a **sample blog post** with rich content.

## Features

- Syntax highlighting
- Responsive images
- Lazy loading
- Secure rendering

\`\`\`typescript
// Example code block
const greeting = (name: string): string => {
  return \`Hello, \${name}!\`
}

console.log(greeting('World'))
\`\`\`

## Images

![Sample Image](/uploads/sample.jpg "This is a sample image")

## Links

Check out [Vue 3 Documentation](https://vuejs.org) for more information.

> This is a blockquote with important information.

## Table Example

| Feature | Supported |
|---------|-----------|
| Markdown | ✅ |
| HTML | ✅ |
| Syntax Highlighting | ✅ |
        `,
        publishedAt: new Date().toISOString(),
        tags: {
          data: [
            { id: 1, attributes: { name: 'Vue.js' } },
            { id: 2, attributes: { name: 'TypeScript' } },
          ],
        },
      },
    }
  } catch (err) {
    error.value = 'Failed to load post'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Load post on mount
loadPost()
</script>
