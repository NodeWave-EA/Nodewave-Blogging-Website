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

    container: {
      base: "w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8",
    },

    header: {
      slots: {
        root: "sticky top-0 z-50 pt-2.5 pb-1 px-3 sm:px-6 lg:px-8 bg-transparent border-0 shadow-none transition-all duration-300",
        container:
          "max-w-(--ui-container) mx-auto h-13 sm:h-14 px-3 sm:px-4 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] flex items-center justify-between gap-2 transition-colors duration-300",
        left: "flex items-center justify-start min-w-0 shrink lg:flex-1",
        center: "hidden lg:flex items-center justify-center shrink-0",
        right: "flex items-center justify-end gap-1 shrink-0 lg:flex-1",
        title:
          "shrink-0 font-extrabold text-xl text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight",
        toggle:
          "lg:hidden rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-bg) text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer",
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

    footer: {
      slots: {
        root: "border-t-0 bg-transparent p-0 m-0",
        container: "p-0 max-w-none",
      },
    },

    pageHeader: {
      slots: {
        root: "relative border-b border-(--app-border) py-8 mb-8 sm:mb-10",
        wrapper: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4",
        headline: "mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400",
        title:
          "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]",
        description:
          "mt-4 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed",
        links: "flex flex-wrap items-center gap-2 mt-4 lg:mt-0",
      },
    },

    pageBody: {
      base: "mt-6 pb-4 space-y-8",
    },

    button: {
      defaultVariants: {
        size: "md",
        color: "primary",
      },
      slots: {
        base: "inline-flex items-center justify-center rounded-xs font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
      },
    },

    badge: {
      defaultVariants: {
        variant: "subtle",
        size: "md",
      },
      slots: {
        base: "inline-flex items-center rounded-xs font-mono font-bold tracking-wider uppercase",
      },
    },

    kbd: {
      base: "inline-flex items-center justify-center px-1.5 rounded-xs border border-(--app-border) bg-(--app-bg)/90 font-mono font-medium text-neutral-600 dark:text-neutral-300 shadow-2xs",
    },

    skeleton: {
      base: "animate-pulse rounded-xs bg-(--app-surface-subtle)",
    },

    input: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        root: "relative inline-flex items-center transition-all duration-200 rounded-xs",
      },
    },

    avatar: {
      defaultVariants: {
        size: "md",
      },
      slots: {
        root: "inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-xs bg-(--app-surface-subtle) ring-1 ring-(--app-border)",
      },
    },

    tooltip: {
      slots: {
        content:
          "z-50 flex items-center gap-1 rounded-xs border border-(--app-border) bg-(--app-surface-subtle) px-2.5 py-1 font-mono text-xs text-neutral-900 dark:text-neutral-100 shadow-xs delay-300 select-none",
      },
    },

    navigationMenu: {
      slots: {
        root: "transition-all duration-200",
      },
    },

    card: {
      slots: {
        root: "rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden",
        header: "p-4 sm:px-6 border-b border-(--app-border)",
        body: "flex flex-col gap-4 p-4 sm:p-6",
        footer: "p-4 sm:px-6 border-t border-(--app-border)",
      },
    },

    contentSearch: {
      slots: {
        modal: "rounded-xs border border-(--app-border) bg-(--app-bg) shadow-xl overflow-hidden",
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
        help: "m-0 text-xs text-neutral-500 dark:text-neutral-400 font-medium",
        label: "text-sm font-bold text-neutral-900 dark:text-white",
      },
    },

    link: {
      variants: {
        active: {
          false:
            "text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors",
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
  },
});
