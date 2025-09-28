import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  js.configs.recommended, // replaces "eslint:recommended"
  prettier, // replaces "prettier"
  pluginPrettierRecommended, // replaces "plugin:prettier/recommended"
  {
    rules: {
      // add your custom rules here
    },
  },
]
