/**
 * Seed data for blog content types
 * Run this script to populate your blog with sample data
 */

import type { Core } from '@strapi/strapi';

const seedData = {
  // Sample categories
  categories: [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest trends and insights in technology',
      color: '#3B82F6',
      icon: 'laptop',
      featured: true,
      order: 1,
      meta_title: 'Technology Articles & Insights',
      meta_description:
        'Discover the latest technology trends, tutorials, and insights from industry experts.',
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Frontend, backend, and full-stack development tutorials',
      color: '#10B981',
      icon: 'code',
      featured: true,
      order: 2,
      meta_title: 'Web Development Tutorials',
      meta_description: 'Learn web development with our comprehensive tutorials and guides.',
    },
    {
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'iOS, Android, and cross-platform mobile development',
      color: '#8B5CF6',
      icon: 'smartphone',
      featured: false,
      order: 3,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'DevOps practices, tools, and methodologies',
      color: '#F59E0B',
      icon: 'server',
      featured: true,
      order: 4,
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX design, visual design, and design thinking',
      color: '#EF4444',
      icon: 'palette',
      featured: false,
      order: 5,
    },
  ],

  // Sample tags
  tags: [
    {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript programming language',
      color: '#F7DF1E',
      trending: true,
    },
    {
      name: 'React',
      slug: 'react',
      description: 'React.js framework',
      color: '#61DAFB',
      trending: true,
    },
    {
      name: 'Vue.js',
      slug: 'vue-js',
      description: 'Vue.js framework',
      color: '#4FC08D',
      trending: true,
    },
    {
      name: 'Node.js',
      slug: 'node-js',
      description: 'Node.js runtime',
      color: '#339933',
      trending: true,
    },
    {
      name: 'TypeScript',
      slug: 'typescript',
      description: 'TypeScript language',
      color: '#3178C6',
      trending: true,
    },
    {
      name: 'Python',
      slug: 'python',
      description: 'Python programming language',
      color: '#3776AB',
      trending: true,
    },
    {
      name: 'Docker',
      slug: 'docker',
      description: 'Docker containerization',
      color: '#2496ED',
      trending: false,
    },
    {
      name: 'Kubernetes',
      slug: 'kubernetes',
      description: 'Kubernetes orchestration',
      color: '#326CE5',
      trending: false,
    },
    {
      name: 'AWS',
      slug: 'aws',
      description: 'Amazon Web Services',
      color: '#FF9900',
      trending: true,
    },
    {
      name: 'GraphQL',
      slug: 'graphql',
      description: 'GraphQL query language',
      color: '#E10098',
      trending: false,
    },
  ],

  // Sample authors
  authors: [
    {
      name: 'John Smith',
      slug: 'john-smith',
      email: 'john.smith@example.com',
      bio: '<p>Senior Full-Stack Developer with over 8 years of experience in web technologies. Passionate about JavaScript, React, and Node.js.</p>',
      job_title: 'Senior Full-Stack Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      website: 'https://johnsmith.dev',
      featured: true,
      follower_count: 1250,
      social_links: [
        { platform: 'twitter', url: 'https://twitter.com/johnsmith', username: 'johnsmith' },
        { platform: 'github', url: 'https://github.com/johnsmith', username: 'johnsmith' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/johnsmith', username: 'johnsmith' },
      ],
      meta_description:
        'Senior Full-Stack Developer sharing insights on web development and technology.',
    },
    {
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      email: 'sarah.johnson@example.com',
      bio: '<p>DevOps Engineer and Cloud Architect specializing in AWS and containerization technologies. Love automating everything!</p>',
      job_title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Seattle, WA',
      featured: true,
      follower_count: 890,
      social_links: [
        { platform: 'twitter', url: 'https://twitter.com/sarahdevops', username: 'sarahdevops' },
        { platform: 'github', url: 'https://github.com/sarahjohnson', username: 'sarahjohnson' },
      ],
    },
    {
      name: 'Michael Chen',
      slug: 'michael-chen',
      email: 'michael.chen@example.com',
      bio: '<p>Mobile App Developer with expertise in React Native and Flutter. Building beautiful cross-platform applications.</p>',
      job_title: 'Mobile App Developer',
      company: 'AppInnovate',
      location: 'Austin, TX',
      featured: false,
      follower_count: 567,
      social_links: [
        { platform: 'twitter', url: 'https://twitter.com/michaelchen', username: 'michaelchen' },
        { platform: 'github', url: 'https://github.com/michaelchen', username: 'michaelchen' },
      ],
    },
  ],

  // Sample blog posts
  blogPosts: [
    {
      title: 'Getting Started with React 18: New Features and Best Practices',
      slug: 'getting-started-react-18-new-features',
      excerpt:
        'Explore the exciting new features in React 18 including concurrent rendering, automatic batching, and Suspense improvements. Learn how to upgrade your applications and take advantage of these powerful new capabilities.',
      content: `
        <h2>Introduction to React 18</h2>
        <p>React 18 brings several groundbreaking features that improve performance and developer experience. In this comprehensive guide, we'll explore the key features and how to implement them in your applications.</p>

        <h3>Concurrent Rendering</h3>
        <p>One of the most significant additions in React 18 is concurrent rendering. This feature allows React to work on multiple tasks simultaneously, improving the overall performance of your applications.</p>

        <pre><code>import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);</code></pre>

        <h3>Automatic Batching</h3>
        <p>React 18 automatically batches updates for better performance, even in promises, setTimeout, and native event handlers.</p>

        <h3>Suspense Improvements</h3>
        <p>Suspense now works on the server and supports more use cases, making it easier to implement loading states and code splitting.</p>

        <h2>Migration Guide</h2>
        <p>Upgrading to React 18 is straightforward for most applications. Here's a step-by-step guide to help you migrate your existing React application.</p>
      `,
      featured: true,
      allow_comments: true,
      status: 'published',
      priority: 'high',
      meta_title: 'React 18 Guide: New Features and Best Practices',
      meta_description:
        'Complete guide to React 18 new features including concurrent rendering, automatic batching, and Suspense improvements.',
      meta_keywords: 'React 18, concurrent rendering, automatic batching, Suspense, React upgrade',
      social_sharing: {
        enable_sharing: true,
        platforms: ['twitter', 'facebook', 'linkedin', 'reddit'],
        custom_message: 'Check out this comprehensive guide to React 18!',
        hashtags: 'React,JavaScript,WebDev',
        via_username: 'johnsmith',
      },
      seo: {
        og_title: 'React 18 Complete Guide',
        og_description: "Learn about React 18's new features and how to upgrade your applications",
        og_type: 'article',
        twitter_card: 'summary_large_image',
        robots: 'index,follow',
      },
    },
    {
      title: 'Docker and Kubernetes: A Complete DevOps Guide',
      slug: 'docker-kubernetes-complete-devops-guide',
      excerpt:
        'Master containerization and orchestration with Docker and Kubernetes. This comprehensive guide covers everything from basic concepts to advanced deployment strategies.',
      content: `
        <h2>Introduction to Containerization</h2>
        <p>Containerization has revolutionized how we deploy and manage applications. Docker and Kubernetes are the leading technologies in this space.</p>

        <h3>Getting Started with Docker</h3>
        <p>Docker allows you to package applications and their dependencies into lightweight containers.</p>

        <pre><code>FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]</code></pre>

        <h3>Kubernetes Orchestration</h3>
        <p>Kubernetes provides powerful orchestration capabilities for managing containerized applications at scale.</p>

        <h2>Best Practices</h2>
        <p>Learn about security, monitoring, and optimization strategies for production deployments.</p>
      `,
      featured: true,
      allow_comments: true,
      status: 'published',
      priority: 'normal',
      meta_title: 'Docker & Kubernetes DevOps Guide',
      meta_description:
        'Complete guide to containerization and orchestration with Docker and Kubernetes for DevOps engineers.',
      social_sharing: {
        enable_sharing: true,
        platforms: ['twitter', 'linkedin', 'reddit'],
        hashtags: 'Docker,Kubernetes,DevOps,Containers',
      },
    },
    {
      title: 'Building Cross-Platform Mobile Apps with React Native',
      slug: 'building-cross-platform-mobile-apps-react-native',
      excerpt:
        'Learn how to build high-performance mobile applications for both iOS and Android using React Native. Covers navigation, state management, and native modules.',
      content: `
        <h2>Why Choose React Native?</h2>
        <p>React Native allows developers to build native mobile applications using React and JavaScript. This approach offers significant advantages in terms of development speed and code reuse.</p>

        <h3>Setting Up Your Development Environment</h3>
        <p>Before we start building, let's set up the development environment for React Native development.</p>

        <h3>Navigation with React Navigation</h3>
        <p>Navigation is a crucial part of any mobile application. React Navigation provides a powerful and flexible navigation solution.</p>

        <h3>State Management</h3>
        <p>Managing application state effectively is key to building scalable mobile applications. We'll explore different approaches including Redux and Context API.</p>
      `,
      featured: false,
      allow_comments: true,
      status: 'published',
      priority: 'normal',
    },
  ],

  // Blog settings
  blogSettings: {
    site_name: 'DevBlog',
    site_description:
      'A blog for developers, by developers. Sharing knowledge, tutorials, and insights about modern software development.',
    site_url: 'https://devblog.example.com',
    posts_per_page: 12,
    allow_comments: true,
    moderate_comments: true,
    analytics_code: '<!-- Add your analytics code here -->',
    footer_text: '<p>&copy; 2024 DevBlog. All rights reserved. Built with ❤️ and Strapi.</p>',
    contact_email: 'hello@devblog.example.com',
    newsletter_enabled: true,
    rss_enabled: true,
    sitemap_enabled: true,
    search_enabled: true,
    theme: 'light',
    timezone: 'UTC',
    date_format: 'MMMM DD, YYYY',
    time_format: 'HH:mm',
    social_links: [
      { platform: 'twitter', url: 'https://twitter.com/devblog', username: 'devblog' },
      { platform: 'github', url: 'https://github.com/devblog', username: 'devblog' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/devblog', username: 'devblog' },
    ],
  },

  // Company info (convertible single-type -> collection seed)
  companyInfo: {
    site_title: 'DevBlog',
    site_description: 'A blog for developers, by developers. Sharing knowledge and tutorials.',
    company_name: 'DevBlog LLC',
    contact_email: 'hello@devblog.example.com',
    contact_phone: '+1 (555) 123-4567',
    address: '123 Dev Street, Tech City, TX',
    website_url: 'https://devblog.example.com',
    social_links: [
      { platform: 'twitter', url: 'https://twitter.com/devblog', username: 'devblog' },
      { platform: 'github', url: 'https://github.com/devblog', username: 'devblog' },
    ],
    about_company: '<p>DevBlog is a community-driven blog for software developers.</p>',
    mission_statement: '<p>Share practical, high-quality developer content.</p>',
    vision_statement: '<p>Empower developers worldwide through education.</p>',
    newsletter_enabled: true,
    comments_enabled: true,
  },
}

/**
 * Seed the database with sample data
 */
export const seedDatabase = async (strapi: Core.Strapi) => {
  console.log('🌱 Starting database seeding...')

  try {
    // Seed categories
    console.log('📁 Seeding categories...')
    const categories = []
    for (const categoryData of seedData.categories) {
      const category = await strapi.entityService.create('api::category.category', {
        data: { ...categoryData, publishedAt: new Date() },
      })
      categories.push(category)
    }

    // Seed tags
    console.log('🏷️ Seeding tags...')
    const tags = []
    for (const tagData of seedData.tags) {
      const tag = await strapi.entityService.create('api::tag.tag', {
        data: { ...tagData, publishedAt: new Date() },
      })
      tags.push(tag)
    }

    // Seed authors
    console.log('👥 Seeding authors...')
    const authors = []
    for (const authorData of seedData.authors) {
      const author = await strapi.entityService.create('api::author.author', {
        data: {
          ...authorData,
          publishedAt: new Date(),
          social_links:
            authorData.social_links?.map(link => ({
              platform: link.platform as
                | 'twitter'
                | 'facebook'
                | 'instagram'
                | 'linkedin'
                | 'github'
                | 'youtube'
                | 'tiktok'
                | 'pinterest'
                | 'discord'
                | 'telegram'
                | 'whatsapp'
                | 'website'
                | 'other',
              url: link.url,
              username: link.username,
            })) || [],
        },
      })
      authors.push(author)
    }

    // Seed blog posts
    console.log('📝 Seeding blog posts...')
    for (let i = 0; i < seedData.blogPosts.length; i++) {
      const postData = seedData.blogPosts[i]
      const { seo, social_sharing, status, priority, ...restPostData } = postData

      const post = await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
          ...restPostData,
          author: authors[i % authors.length].id,
          categories: categories[i % categories.length].id,
          tags: tags[i % tags.length].id,
          status: (status || 'published') as 'draft' | 'published',
          priority: (priority || 'normal') as 'low' | 'normal' | 'high',
          seo: seo
            ? {
              ...seo,
              og_type: (seo.og_type || 'article') as 'website' | 'article' | 'profile',
              twitter_card: (seo.twitter_card || 'summary_large_image') as
                | 'summary'
                | 'summary_large_image'
                | 'app'
                | 'player',
              robots: (seo.robots || 'index,follow') as
                | 'index,follow'
                | 'noindex,follow'
                | 'index,nofollow'
                | 'noindex,nofollow',
            }
            : undefined,
          social_sharing: social_sharing
            ? {
              ...social_sharing,
            }
            : undefined,
          publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Stagger publication dates
        },
      })
      console.log(`Created blog post: ${post.title}`)
    }

    // Seed blog settings
    console.log('⚙️ Seeding blog settings...')
    await strapi.entityService.create('api::blog-setting.blog-setting', {
      data: {
        ...seedData.blogSettings,
        theme: seedData.blogSettings.theme as 'light' | 'dark' | 'auto',
        social_links:
          seedData.blogSettings.social_links?.map(link => ({
            platform: link.platform as
              | 'twitter'
              | 'facebook'
              | 'instagram'
              | 'linkedin'
              | 'github'
              | 'youtube'
              | 'tiktok'
              | 'pinterest'
              | 'discord'
              | 'telegram'
              | 'whatsapp'
              | 'website'
              | 'other',
            url: link.url,
            username: link.username,
          })) || [],
      },
    })

    // Seed company info (now a collection-type)
    console.log('🏢 Seeding company info...')
    await strapi.entityService.create('api::company-info.company-info', {
      data: {
        ...seedData.companyInfo,
        social_links:
          seedData.companyInfo.social_links?.map(link => ({
            platform: link.platform as
              | 'twitter'
              | 'facebook'
              | 'instagram'
              | 'linkedin'
              | 'github'
              | 'youtube'
              | 'tiktok'
              | 'pinterest'
              | 'discord'
              | 'telegram'
              | 'whatsapp'
              | 'website'
              | 'other',
            url: link.url,
            username: link.username,
          })) || [],
      },
    })

    console.log('✅ Database seeding completed successfully!')
    console.log(
      `Created: ${categories.length} categories, ${tags.length} tags, ${authors.length} authors, ${seedData.blogPosts.length} posts`
    )
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

export default seedData
