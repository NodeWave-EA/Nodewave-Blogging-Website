export default defineAppConfig({
  ui: {
    colors: {
      primary: "teal",
      secondary: "blue",
      success: "green",
      info: "sky",
      warning: "amber",
      error: "red",
      neutral: "zinc",
    },
    strategy: "override",

    button: {
      defaultVariants: {
        size: "lg",
        color: "primary",
      },
      slots: {
        base: "rounded-xl font-semibold transition-all duration-200",
      },
    },
    badge: {
      defaultVariants: {
        variant: "subtle",
        size: "md",
      },
      slots: {
        base: "font-bold rounded-lg tracking-wide uppercase",
      },
    },
    input: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        root: "transition-all duration-200 rounded-xl",
      },
    },
    avatar: {
      defaultVariants: {
        size: "md",
      },
      slots: {
        root: "rounded-xl ring-1 ring-gray-200 dark:ring-gray-800",
      },
    },
    tooltip: {
      slots: {
        content: "delay-300 font-medium text-xs rounded-lg",
      },
    },
    navigationMenu: {
      slots: {
        root: "transition-all duration-200",
      },
    },
    card: {
      slots: {
        root: "rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-xs hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden",
        body: "flex flex-col gap-4 p-6 sm:p-8",
      },
    },
    formField: {
      slots: {
        container: "flex flex-col gap-1.5",
        help: "m-0 text-xs text-gray-400 dark:text-gray-500 font-medium",
        label: "text-sm font-bold text-gray-900 dark:text-white",
      },
    },
    link: {
      variants: {
        active: {
          false:
            "text-gray-500 dark:text-gray-400 hover:text-primary transition-colors",
        },
      },
    },
    toaster: {
      slots: {
        viewport: "z-10001 p-4",
      },
    },
    icons: {
      loading: "i-lucide-loader-circle",
      search: "i-lucide-search",
      menu: "i-lucide-menu",
    },
    experimental: {
      componentDetection: true,
    },

    header: {
      slots: {
        root: "bg-transparent backdrop-blur-md border-b border-gray-100 dark:border-gray-900 h-(--ui-header-height) sticky top-0 z-50 transition-colors duration-300",
        container:
          "flex items-center justify-between gap-3 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        left: "lg:flex-1 flex items-center gap-2",
        center: "hidden lg:flex items-center gap-6",
        right: "flex items-center justify-end lg:flex-1 gap-3",
        title:
          "shrink-0 font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-2 tracking-tight",
        toggle: "lg:hidden",
        content: "lg:hidden",
        overlay: "lg:hidden bg-gray-950/20 backdrop-blur-xs",
        header:
          "px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-900",
        body: "p-6 overflow-y-auto space-y-6",
      },
      variants: {
        toggleSide: {
          left: {
            toggle: "-ms-1.5",
          },
          right: {
            toggle: "-me-1.5",
          },
        },
      },
    },
  },
});
