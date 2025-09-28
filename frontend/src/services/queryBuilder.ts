import { dbg } from '@/utils/debug'

/**
 * Build a URL-encoded query string from a plain object for use with Strapi requests.
 *
 * This function iterates over the supplied `params` object and appends each entry to a
 * URLSearchParams instance, returning the encoded string (without a leading '?').
 *
 * Behavior details:
 * - Parameters with values `undefined`, `null`, or the empty string (`''`) are skipped.
 * - Array values are appended as repeated parameters using the "key[]" form (e.g. `tags[]=a&tags[]=b`).
 * - Non-string values (numbers, booleans, etc.) are converted using `String(value)`.
 * - URLSearchParams is used to ensure proper percent-encoding of keys and values.
 * - Parameters are appended in insertion order.
 * - The function emits a debug log of the input `params` as a side effect.
 *
 * @param params - A record of query parameter keys to values. Values can be primitives or arrays of primitives.
 * @returns The URL-encoded query string (e.g. `foo=1&bar%5B%5D=a&bar%5B%5D=b`), or an empty string if no parameters were appended.
 *
 * @example
 * buildStrapiQuery({ page: 1, tags: ['js', 'ts'], search: 'node' })
 * // -> "page=1&tags%5B%5D=js&tags%5B%5D=ts&search=node"
 */
export function buildStrapiQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(`${key}[]`, String(item)))
      } else {
        query.append(key, String(value))
      }
    }
  })

  dbg('queryBuilder.ts', 'buildStrapiQuery', { params })
  return query.toString()
}
