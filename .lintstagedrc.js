export default {
  // Backend files
  'backend/**/*.{js,ts,mts}': ['eslint --fix', 'prettier --write'],
  'backend/**/*.json': ['prettier --write'],

  // Frontend files
  'frontend/**/*.{js,ts,vue}': ['eslint --fix', 'prettier --write'],
  'frontend/**/*.{json,css,scss}': ['prettier --write'],

  // Root level files
  '*.{js,ts,mts,json,yml,yaml,md}': ['prettier --write'],

  // Docker files
  'docker-compose.yml': ['prettier --write'],
  '**/Dockerfile': ['prettier --write'],
}
