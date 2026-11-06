import { defineLive } from 'next-sanity/live'
import { client } from './client'

// Token is strictly restricted to server-side operations.
// We explicitly set browserToken to false to guarantee SANITY_API_READ_TOKEN
// is never serialized or bundled into client-side code or props.
const token = process.env.SANITY_API_READ_TOKEN

const { sanityFetch: internalSanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: false,
})

export { SanityLive }

export type SanityFetchResult<T> = {
  data: T
  sourceMap?: unknown
  tags?: string[]
}

export async function sanityFetch<T = unknown>(
  options: Parameters<typeof internalSanityFetch>[0]
): Promise<SanityFetchResult<T>> {
  const result = await internalSanityFetch(options)
  return result as unknown as SanityFetchResult<T>
}
