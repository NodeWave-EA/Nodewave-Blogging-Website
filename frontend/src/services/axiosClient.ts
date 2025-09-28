import { moduleLoaded } from '@/utils/debug'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import NProgress from 'nprogress'

moduleLoaded('axiosClient.ts')

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api'
const API_TOKEN = import.meta.env.VITE_API_TOKEN

if (!API_TOKEN) {
  console.error(
    '[axiosClient] VITE_API_TOKEN is not set. Requests to Strapi will fail without a valid API token.',
  )
  console.error('[axiosClient] Please add VITE_API_TOKEN to your .env file.')
  throw new Error('VITE_API_TOKEN is required to access the Strapi API. Check your .env file.')
}

// Create axios instance
/**
 * Pre-configured Axios instance for communicating with the application's API.
 *
 * This AxiosInstance is created with sane defaults for the frontend:
 * - baseURL: API_BASE_URL (the root URL for all API requests)
 * - timeout: 30_000 ms (requests taking longer will be aborted)
 * - default headers:
 *   - 'Content-Type': 'application/json'
 *   - 'Authorization': `Bearer ${API_TOKEN}` (uses the configured API token)
 *
 * Use this exported instance for all HTTP requests to ensure consistent base URL,
 * timeout and headers across the application.
 *
 * Remarks:
 * - Ensure API_BASE_URL and API_TOKEN are provided via your environment/configuration
 *   and are kept secure (do not commit secrets to source control).
 * - Consider attaching request/response interceptors to this instance for:
 *   - automatic token refresh
 *   - centralized error handling/logging
 * - The instance type is AxiosInstance from the axios library.
 *
 * Example:
 * const res = await axiosClient.get('/posts');
 *
 * @public
 * @constant
 * @type {AxiosInstance}
 * @see https://github.com/axios/axios
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    NProgress.start()
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${API_TOKEN}`
    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    NProgress.done()
    return response
  },
  (error) => {
    NProgress.done()
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  },
)
