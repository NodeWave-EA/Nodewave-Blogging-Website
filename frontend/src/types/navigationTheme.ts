export interface NavigationItem {
	name: string
	href: string
	current?: boolean
	children?: NavigationItem[]
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
	mode: ThemeMode
	primaryColor?: string
	accentColor?: string
}
