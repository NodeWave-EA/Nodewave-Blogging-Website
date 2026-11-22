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
        root: "rounded-xl ring-1 ring-(--app-border)",
      },
    },
    tooltip: {
      slots: {
        content: "delay-300 font-medium text-xs rounded-xs border border-(--app-border)",
      },
    },
    navigationMenu: {
      slots: {
        root: "transition-all duration-200",
      },
    },
    card: {
      slots: {
        root: "rounded-2xl border border-(--app-border) bg-(--app-bg) shadow-xs hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden",
        body: "flex flex-col gap-4 p-6 sm:p-8",
      },
    },
    contentToc: {
      slots: {
        root: "sticky top-(--ui-header-height) z-20 bg-(--app-bg)/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-(--app-border) lg:border-b-0 -mx-4 px-4 sm:px-6 lg:mx-0 lg:px-0 overflow-y-auto max-h-[calc(100vh-var(--ui-header-height))]",
        container: "pt-2.5 pb-3 lg:py-0 border-b-0",
        trigger: "font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 py-1.5",
        title: "font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400",
        list: "space-y-0.5",
        link: "font-mono text-xs py-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 data-[active]:text-primary-600 dark:data-[active]:text-primary-400 data-[active]:font-semibold transition-colors",
        indicator: "bg-primary-500",
      },
    },
    contentSurround: {
      slots: {
        root: "grid grid-cols-1 sm:grid-cols-2 gap-3",
        link: "group relative flex flex-col justify-between p-4 sm:p-5 rounded-xs border border-(--app-border) bg-(--app-bg) hover:bg-(--app-surface-hover) hover:border-primary-500/50 transition-colors duration-200",
        linkLeading:
          "inline-flex items-center justify-center size-7 rounded-xs border border-(--app-border) bg-(--app-surface-subtle) text-neutral-600 dark:text-neutral-400 group-hover:border-primary-500/40 group-hover:text-primary-500 mb-3 transition-colors",
        linkLeadingIcon: "size-3.5",
        linkTitle:
          "font-sans font-semibold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1",
        linkDescription:
          "font-sans text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed",
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
      close: "i-lucide-x",
    },
    experimental: {
      componentDetection: true,
    },

    header: {
      slots: {
        root: "sticky top-0 z-50 h-(--ui-header-height) bg-(--app-bg)/85 backdrop-blur-md border-b border-(--app-border) transition-all duration-300",
        container:
          "flex items-center justify-between gap-3 h-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8",
        left: "lg:flex-1 flex items-center gap-2 min-w-0",
        center: "hidden lg:flex items-center justify-center",
        right: "flex items-center justify-end lg:flex-1 gap-1.5",
        title:
          "shrink-0 font-extrabold text-xl text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight",
        toggle:
          "lg:hidden rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-surface-hover) text-neutral-700 dark:text-neutral-300",
        content: "lg:hidden bg-(--app-bg) border-l border-(--app-border)",
        overlay: "lg:hidden bg-neutral-950/40 backdrop-blur-xs",
        header:
          "px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-(--app-border) bg-(--app-bg)",
        body: "p-4 sm:p-6 overflow-y-auto bg-(--app-bg) flex-1",
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
