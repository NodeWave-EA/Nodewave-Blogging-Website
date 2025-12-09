<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8">Rich Text Renderer Test Page</h1>

    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 1: Headings</h2>
        <RichText :content="testHeadings" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 2: Nested Lists</h2>
        <RichText :content="testNestedLists" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 3: Task Lists</h2>
        <RichText :content="testTaskLists" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 4: Tables</h2>
        <RichText :content="testTables" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 5: Code Blocks</h2>
        <RichText :content="testCodeBlocks" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 6: Callouts</h2>
        <RichText :content="testCallouts" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 7: HTML Embeds</h2>
        <RichText :content="testHtmlEmbeds" :allow-iframes="true" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 8: YouTube Embeds</h2>
        <RichText :content="testYouTubeEmbeds" :allow-iframes="true" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 9: Images</h2>
        <RichText :content="testImages" :lazy-images="true" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 10: Blockquotes (Nested)</h2>
        <RichText :content="testBlockquotes" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Test 11: Mixed Content</h2>
        <RichText :content="testMixedContent" :allow-iframes="true" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import RichText from './RichText.vue'

const testHeadings = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`

const testNestedLists = `
**Unordered List:**
- Item 1
- Item 2
  - Nested 2.1
  - Nested 2.2
    - Deeply nested 2.2.1
    - Deeply nested 2.2.2
  - Nested 2.3
- Item 3

**Ordered List:**
1. First item
2. Second item
   1. Nested 2.1
   2. Nested 2.2
      1. Deeply nested
3. Third item

**Mixed List:**
1. Ordered item
   - Unordered nested
   - Another unordered
2. Back to ordered
`

const testTaskLists = `
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed
  - [ ] Nested incomplete
  - [x] Nested completed
- [ ] Final task
`

const testTables = `
**Basic Table:**

| Feature | Status | Priority |
|---------|--------|----------|
| Headings | ✅ Done | High |
| Lists | ✅ Done | High |
| Tables | ✅ Done | Medium |
| Embeds | 🚧 Testing | Low |

**Complex Table:**

| Name | Role | Email | Location | Status |
|------|------|-------|----------|--------|
| John Doe | Developer | john@example.com | NYC | Active |
| Jane Smith | Designer | jane@example.com | LA | Active |
| Bob Johnson | Manager | bob@example.com | SF | Away |

**Aligned Table:**

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Text left | Text center | Text right |
| More left | More center | More right |
| Final left | Final center | Final right |
`

const testCodeBlocks = `
Inline code: \`const x = 42;\`

Block code:
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

Python example:
\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`
`

const testCallouts = `
> [!NOTE]
> This is a note callout. It provides additional information.

> [!TIP]
> This is a tip callout. It offers helpful advice.

> [!IMPORTANT]
> This is an important callout. Pay attention to this!

> [!WARNING]
> This is a warning callout. Be careful here.

> [!CAUTION]
> This is a caution callout. Danger ahead!
`

const testHtmlEmbeds = `
Regular paragraph before HTML.

<details>
  <summary>Click to expand</summary>
  This is hidden content inside a details element.
</details>

Keyboard shortcuts: Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Highlighted text: This is <mark>very important</mark> text.

Formulas: H<sub>2</sub>O and E = mc<sup>2</sup>

Regular paragraph after HTML.
`

const testYouTubeEmbeds = `
YouTube video (full URL):
https://www.youtube.com/watch?v=dQw4w9WgXcQ

YouTube video (short URL):
https://youtu.be/dQw4w9WgXcQ

Regular link (should not convert):
[Visit YouTube](https://www.youtube.com)
`

const testImages = `
Text before image.

![Beautiful landscape](https://via.placeholder.com/1200x600 "A stunning landscape view")

This image should take full width and scale responsively.

![Portrait photo](https://via.placeholder.com/800x1200 "Portrait orientation")

![Wide panorama](https://via.placeholder.com/1600x400)

Text after images - all should be full width and responsive.
`

const testBlockquotes = `
> Simple blockquote

> First level
>> Second level
>>> Third level

> Blockquote with **bold** and *italic* text
> 
> Multiple paragraphs in blockquote
`

const testMixedContent = `
# Complete Example

This demonstrates **all features** together.

## Lists and Tasks

- Regular item
- [x] Completed task
  - [ ] Nested task
  
## Code

Inline \`code\` and block:

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

## Table

| Column 1 | Column 2 |
|----------|----------|
| A | B |
| C | D |

## Callout

> [!TIP]
> Use the test page to verify all features!

## Media

![Test Image](https://via.placeholder.com/400x200)

YouTube:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

## HTML Elements

Press <kbd>Enter</kbd> to continue.

<details>
<summary>More info</summary>
Hidden content here.
</details>

---

The end!
`
</script>

<style scoped>
.container {
  background-color: rgb(var(--color-background));
}

section {
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  background-color: rgb(var(--color-card));
}

h2 {
  color: rgb(var(--color-primary));
}
</style>
