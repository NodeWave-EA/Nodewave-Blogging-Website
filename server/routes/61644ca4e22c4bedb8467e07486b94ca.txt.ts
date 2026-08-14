export default defineEventHandler((event) => {
  const targetKey = '61644ca4e22c4bedb8467e07486b94ca'
  const paramKey = getRouterParam(event, 'key')

  // Strip '.txt' if present in the request path
  const key = paramKey?.replace(/\.txt$/, '')

  // Match key
  if (key === targetKey) {
    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return targetKey
  }

  // Otherwise drop a standard 404 for unrelated text lookups
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
