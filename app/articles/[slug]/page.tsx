import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { stegaClean } from 'next-sanity'
import { client } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/live'
import { POST_QUERY, POST_SLUGS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { CustomPortableText } from '@/app/components/sanity/PortableText'
import type { SanityPost, SanityCategory } from '@/lib/sanity/types'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY)
    if (!Array.isArray(slugs)) return []
    return slugs
      .filter((item) => typeof item?.slug === 'string' && item.slug.length > 0)
      .map((item) => ({ slug: stegaClean(item.slug) }))
  } catch (error) {
    console.error('Failed to generate static params for articles:', error)
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = stegaClean(slug)

  const { data: post } = await sanityFetch<SanityPost | null>({
    query: POST_QUERY,
    params: { slug: cleanSlug },
  })

  if (!post) {
    return {
      title: 'Article Not Found | Tameer-e-Sehat',
    }
  }

  const cleanTitle = stegaClean(post.title) || 'Article'
  const cleanExcerpt = post.excerpt ? stegaClean(post.excerpt) : null
  const cleanPublishedAt = post.publishedAt ? stegaClean(post.publishedAt) : undefined

  const imageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage).width(1200).height(630).fit('crop').auto('format').url()
    : null

  return {
    title: `${cleanTitle} | Tameer-e-Sehat`,
    description: cleanExcerpt || `Read ${cleanTitle} on Tameer-e-Sehat.`,
    openGraph: {
      title: cleanTitle,
      description: cleanExcerpt || undefined,
      type: 'article',
      publishedTime: cleanPublishedAt,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: cleanTitle }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const cleanSlug = stegaClean(slug)

  const { data: post } = await sanityFetch<SanityPost | null>({
    query: POST_QUERY,
    params: { slug: cleanSlug },
  })

  if (!post) {
    notFound()
  }

  const cleanTitle = stegaClean(post.title) || 'Untitled Article'

  const imageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage).width(1400).height(800).fit('crop').auto('format').url()
    : null

  const authorImageUrl = post.author?.image?.asset
    ? urlFor(post.author.image).width(160).height(160).fit('crop').auto('format').url()
    : null

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <article className="min-h-screen bg-surface pb-20">
      {/* Back button & Breadcrumb */}
      <div className="border-b border-line bg-surfaceRaised/50 py-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primaryHover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all articles
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.categories.map((cat: SanityCategory) => (
              <span
                key={cat._id}
                className="inline-flex items-center gap-1 rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold text-primary"
              >
                <Tag className="h-3 w-3" />
                {cat.title}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-4 text-lg text-inkBody sm:text-xl font-normal leading-relaxed italic border-l-4 border-secondary pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Author & Date meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-line py-4 text-sm text-inkMuted">
          {post.author && (
            <div className="flex items-center gap-2.5">
              {authorImageUrl ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-line">
                  <Image
                    src={authorImageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondaryText">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="font-medium text-ink">{post.author.name}</p>
                <p className="text-xs text-inkMuted">Hakeem / Tibbi Specialist</p>
              </div>
            </div>
          )}

          {formattedDate && (
            <div className="flex items-center gap-1.5 ml-auto text-xs sm:text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Published {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Main Cover Image */}
        {imageUrl && (
          <div className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-surfaceSunken shadow-md">
            <Image
              src={imageUrl}
              alt={stegaClean(post.mainImage?.alt) || cleanTitle}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Portable Text Body */}
        <div className="mt-8">
          <CustomPortableText value={post.body} />
        </div>

        {/* Author Bio Footer */}
        {post.author?.bio && (
          <div className="mt-14 rounded-2xl border border-line bg-surfaceRaised p-6 sm:p-8">
            <h4 className="font-serif text-lg font-bold text-ink mb-2">
              About the Author
            </h4>
            <div className="flex items-start gap-4">
              {authorImageUrl && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line">
                  <Image
                    src={authorImageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-ink">{post.author.name}</p>
                <p className="mt-1 text-sm text-inkBody leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
