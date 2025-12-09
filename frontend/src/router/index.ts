import NProgress from 'nprogress'
import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components for better performance
const Home = () => import('@/views/Home.vue')
const BlogIndex = () => import('@/views/blog/index.vue')
const BlogPost = () => import('@/views/blog/[slug].vue')
const CategoriesIndex = () => import('@/views/categories/index.vue')
const Category = () => import('@/views/categories/[slug].vue')
const AuthorsIndex = () => import('@/views/authors/index.vue')
const Author = () => import('@/views/authors/[slug].vue')
const TagsIndex = () => import('@/views/tags/index.vue')
const Tag = () => import('@/views/tags/[slug].vue')
const Contact = () => import('@/views/Contact.vue')
const RichTextTest = () => import('@/components/RichTextTest.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home',
      description: 'Welcome to our company blog',
    },
  },
  {
    path: '/blog',
    name: 'Blog',
    component: BlogIndex,
    meta: {
      title: 'Blog',
      description: 'Read our latest blog posts',
    },
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: BlogPost,
    meta: {
      title: 'Blog Post',
    },
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoriesIndex,
    meta: {
      title: 'Categories',
      description: 'Browse all blog categories',
    },
  },
  {
    path: '/categories/:slug',
    name: 'Category',
    component: Category,
    meta: {
      title: 'Category',
    },
  },
  {
    path: '/authors',
    name: 'Authors',
    component: AuthorsIndex,
    meta: {
      title: 'Authors',
      description: 'Meet our team of writers',
    },
  },
  {
    path: '/authors/:slug',
    name: 'Author',
    component: Author,
    meta: {
      title: 'Author',
    },
  },
  {
    path: '/tags',
    name: 'Tags',
    component: TagsIndex,
    meta: {
      title: 'Tags',
      description: 'Browse all blog tags',
    },
  },
  {
    path: '/tags/:slug',
    name: 'Tag',
    component: Tag,
    meta: {
      title: 'Tag',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: 'Contact',
      description: 'Get in touch with us',
    },
  },
  {
    path: '/richtext-test',
    name: 'RichTextTest',
    component: RichTextTest,
    meta: {
      title: 'Rich Text Test',
      description: 'Test page for rich text renderer features',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 - Page Not Found',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Progress bar on route changes
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
