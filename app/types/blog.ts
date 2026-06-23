import type { BlogPost } from "./schemas";

type TocLinkChild = {
  id: string;
  depth: number;
  text: string;
};

type TocLink = {
  id: string;
  depth: number;
  text: string;
  children: TocLinkChild[];
};

// TODO: Dive deeper into the structure of the body value and create more specific types
// for different content blocks (e.g., paragraphs, code blocks, images, etc.)
type _BodyValueObject = {
  className: string;
  code: string;
  language: string;
  meta: string;
  style: string;
};

type BodyValue = string | [string, Record<string, any>, BodyValue[]];

type BodyToc = {
  title: string;
  searchDepth: number;
  depth: number;
  links: TocLink[];
};

type Body = {
  type: "minimark";
  value: BodyValue[];
  toc: BodyToc;
};

type readingTime = {
  text: string;
  minutes: number;
  time: number;
  words: number;
};

type meta = {
  readingTime: readingTime;
  [key: string]: any;
};

export type BlogType = BlogPost & {
  id: string;
  body: Body;
  extension: string;
  meta: meta;
  navigation: boolean;
  path: string;
  stem: string;
  __hash__: string;
};

const _exampleBlog = {
  id: "blogs/blogs/powershell-bash.md",
  title: "Bash-ify Your PowerShell - The Ultimate Guide to Autosuggestions, Completions, and Subcommands",
  author: {
    id: "authors/authors/gideon-yebei.yml",
    title: "Software Engineer",
    avatar: {
      src: "/blog/authors/gideon-yebei/avatar.jpg",
      alt: "Gideon Yebei's profile picture",
    },
    description: "Gideon is a software engineer with a passion for building scalable web applications. With over 5 years of experience in the industry, he has worked on various projects ranging from startups to large enterprises. Gideon specializes in full-stack development and is proficient in technologies such as JavaScript, React, Node.js, and Python. In his free time, he enjoys contributing to open-source projects and exploring new technologies.",
    email: "yebei@nodewave.net",
    extension: "yml",
    meta: {},
    name: "Gideon Yebei",
    slug: "gideon-yebei",
    socialLinks: [[Object], [Object], [Object]],
    stem: "authors/gideon-yebei",
    website: "https://yebei-gideon.github.io",
    __hash__: "gb7eeTBREBdeqPM6LNshd8OEsWRhnaWh3Dozq-1IpKc",
  },
  body: {
    type: "minimark",
    value: [
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
      [Array],
    ],
    toc: { title: "", searchDepth: 5, depth: 5, links: [Array] },
  },
  categories: [
    {
      id: "categories/categories/terminal-and-shells.yml",
      description: "Deep dives into shell configurations, command-line utilities, and productivity workflows.",
      extension: "yml",
      meta: {},
      name: "Terminal & Shells",
      slug: "terminal-and-shells",
      stem: "categories/terminal-and-shells",
      __hash__: "Z1jdE3p2FNdt9MmMMUX1uEj_VfFra5jqJFDeXnC22hQ",
    },
  ],
  coverImage: {
    src: "/blogs/posts/powershell-bash/cover.png",
    alt: "Stylized terminal window showing predictive text and interactive completion menus",
    caption: "Transform your PowerShell experience with modern shell features.",
  },
  date: "2026-05-28",
  description: "Learn how to make PowerShell look, feel, and behave exactly like a premium Bash/Zsh environment with autosuggestions, interactive subcommand completions, and fuzzy history search.",
  draft: false,
  extension: "md",
  featured: true,
  gallery: [
    {
      src: "/blogs/posts/powershell-bash/psreadline-demo.png",
      alt: "Inline prediction highlighting history matching in the shell buffer",
      caption: "Inline predictions mimic the popular Fish shell experience.",
    },
    {
      src: "/blogs/posts/powershell-bash/carapace-menu.png",
      alt: "Interactive grid showing git subcommand auto-completions via Carapace",
      caption: "Rich multi-shell subcommand menus triggered natively with Ctrl+Space.",
    },
  ],
  meta: {
    readingTime: { text: "5 min read", minutes: 4.45, time: 267000, words: 890 },
  },
  navigation: true,
  path: "/blog/powershell-bash",
  published: true,
  publishedAt: "2026-05-28",
  seo: {
    title: "How to Make PowerShell Behave Like Bash/Zsh (2026 Guide)",
    description: "Step-by-step tutorial to configure pwsh with emacs keybindings, fish-style autocomplete, carapace subcommand popups, and fzf fuzzy history search.",
    keywords: [
      "PowerShell",
      "Bash",
      "Carapace",
      "FZF",
      "PSReadLine",
      "Terminal Productivity",
    ],
    canonicalUrl: "/blog/powershell-bash",
  },
  slug: "powershell-bash",
  stem: "blog/powershell-bash",
  tags: [
    {
      id: "tags/tags/powershell.yml",
      description: "Shell configuration, scripting, and cross-platform automation patterns.",
      extension: "yml",
      meta: {},
      name: "PowerShell",
      slug: "powershell",
      stem: "tags/powershell",
      __hash__: "_2V1ntjd1F14CyDEmXI3QCFTv-MH02Q-BZ4jeQGyUAE",
    },
    {
      id: "tags/tags/command-line.yml",
      description: null,
      extension: "yml",
      meta: {},
      name: "Command Line",
      slug: "command-line",
      stem: "tags/command-line",
      __hash__: "sRVinCEBosS10A_u5kJ0Ty--DuakQ4RM_JvouFVP7Cc",
    },
    {
      id: "tags/tags/devops.yml",
      description: null,
      extension: "yml",
      meta: {},
      name: "DevOps",
      slug: "devops",
      stem: "tags/devops",
      __hash__: "LaEk_6Eq5eXhSjQdz1ZaCSIoIO_tWdyNRWz4IlaX9n4",
    },
  ],
  updatedAt: "2026-05-28",
  __hash__: "qUX_npRTUe0RoDZRt4c5ZzT4AbN5UuaUAZjP-wxw04Q",
};
