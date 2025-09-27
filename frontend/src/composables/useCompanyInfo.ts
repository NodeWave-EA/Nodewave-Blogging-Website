import { apiService } from '@/services'
import type { CompanyInfo } from '@/types'
import { computed, ref } from 'vue'

const companyInfo = ref<CompanyInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useCompanyInfo() {
  const fetchCompanyInfo = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Strapi single-type endpoint in this project is mounted at /company-info
      // apiService.get returns the parsed response, which is the company info object directly
      const response = await apiService.get<CompanyInfo>("/company-info?populate=*")
      companyInfo.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch company info'
      console.error('Error fetching company info:', err)
    } finally {
      loading.value = false
    }
  }

  const siteName = computed(() => companyInfo.value?.site_title || 'NodeWave Blog')
  const siteDescription = computed(
    () => companyInfo.value?.site_description || 'Professional Company Blogging Platform',
  )
  const companyName = computed(() => companyInfo.value?.company_name || 'NodeWave')
  const contactEmail = computed(() => companyInfo.value?.contact_email || '')
  const logo = computed(() => companyInfo.value?.logo?.data?.url || null)
  const logoDark = computed(() => companyInfo.value?.logo_dark?.data?.url || logo.value)
  const socialLinks = computed(() => companyInfo.value?.social_links || [])
  const aboutCompany = computed(() => companyInfo.value?.about_company || '')
  const missionStatement = computed(() => companyInfo.value?.mission_statement || '')
  const visionStatement = computed(() => companyInfo.value?.vision_statement || '')

  return {
    // State
    companyInfo: computed(() => companyInfo.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Actions
    fetchCompanyInfo,

    // Computed properties
    siteName,
    siteDescription,
    companyName,
    contactEmail,
    logo,
    logoDark,
    socialLinks,
    aboutCompany,
    missionStatement,
    visionStatement,
  }
}
