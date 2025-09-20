import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import NProgress from 'nprogress'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api'
const API_TOKEN = import.meta.env.VITE_API_TOKEN

// Enforce presence of API token — this project expects a token to access Strapi endpoints
if (!API_TOKEN) {
	// Fail fast during development so the developer notices missing token
	// eslint-disable-next-line no-console
	console.error('[api] VITE_API_TOKEN is not set. Requests to Strapi will fail without a valid API token.')
	throw new Error('VITE_API_TOKEN is required to access the Strapi API')
}

// Create axios instance
const api: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${API_TOKEN}`,
	},
})

// Request interceptor
api.interceptors.request.use(
	(config) => {
		// Start loading bar
		NProgress.start()

		// Always use the API token from environment
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
api.interceptors.response.use(
	(response) => {
		NProgress.done()
		return response
	},
	(error) => {
		NProgress.done()
		if (error.response?.status === 401) {
			// Handle unauthorized access
			localStorage.removeItem('token')
			// Optionally redirect to login
		}
		return Promise.reject(error)
	},
)

// Generic API helper functions
export const apiService = {
	get: async <T>(url: string, config?: AxiosRequestConfig) => {
		const response = await api.get<T>(url, config)
		return response.data
	},

	post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
		const response = await api.post<T>(url, data, config)
		return response.data
	},

	put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
		const response = await api.put<T>(url, data, config)
		return response.data
	},

	delete: async <T>(url: string, config?: AxiosRequestConfig) => {
		const response = await api.delete<T>(url, config)
		return response.data
	},

	// Utility function to build Strapi query strings
	buildStrapiQuery: (params: Record<string, unknown>) => {
		const query = new URLSearchParams()

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				if (Array.isArray(value)) {
					value.forEach((item) => query.append(`${key}[]`, String(item)))
				} else {
					query.append(key, String(value))
				}
			}
		})

		return query.toString()
	},
}
