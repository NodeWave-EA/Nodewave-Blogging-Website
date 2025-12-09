import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import vueParser from 'vue-eslint-parser'

export default [
  // Ignore patterns - exclude generated and build files
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.strapi/**',
      '**/build/**',
      '**/.cache/**',
      '**/coverage/**',
      '**/types/generated/**',
    ],
  },

  // Base config for all files
  js.configs.recommended,
  prettier,
  pluginPrettierRecommended,

  // Backend TypeScript files
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        // Strapi global
        strapi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Backend JavaScript files
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        // Strapi global
        strapi: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // Frontend Vue files
  {
    files: ['frontend/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser,
      },
      globals: {
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // DOM Types
        HTMLElement: 'readonly',
        HTMLImageElement: 'readonly',
        SVGElement: 'readonly',
        SVGTextElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeJS: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        FocusEvent: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        // Additional Web APIs
        CustomEvent: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        WheelEvent: 'readonly',
        TouchEvent: 'readonly',
        MediaQueryList: 'readonly',
        MediaQueryListEvent: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLIFrameElement: 'readonly',
        HTMLMetaElement: 'readonly',
        HTMLLinkElement: 'readonly',
        HTMLScriptElement: 'readonly',
        alert: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Frontend TypeScript files
  {
    files: ['frontend/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        // DOM Types
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeJS: 'readonly',
        Event: 'readonly',
        IntersectionObserver: 'readonly',
        // Additional Web APIs
        CustomEvent: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLIFrameElement: 'readonly',
        HTMLMetaElement: 'readonly',
        HTMLLinkElement: 'readonly',
        MediaQueryList: 'readonly',
        MediaQueryListEvent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Frontend JavaScript files
  {
    files: ['frontend/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  // Browser scripts in backend/public
  {
    files: ['backend/public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        history: 'readonly',
        MutationObserver: 'readonly',
      },
    },
  },

  // Test files
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/test-*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  // Custom rules for all files
  {
    rules: {
      'no-case-declarations': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
