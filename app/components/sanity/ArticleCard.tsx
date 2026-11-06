import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import { urlFor } from '@/lib/sanity/image'
import type { SanityPost } from '@/lib/sanity/types'
import { Calendar, User } from 'lucide-react'

export interface ArticleCardProps {
  article: SanityPost
}

export function ArticleCard({ article }: ArticleCardProps) {
  const cleanSlug = stegaClean(article.slug?.current) || article._id
  const cleanTitle = stegaClean(article.title) || 'Untitled Article'
  const cleanExcerpt = article.excerpt ? stegaClean(article.excerpt) : null
  const cleanAuthorName = article.author?.name ? stegaClean(article.author.name) : null

  const imageUrl = article.mainImage?.asset
    ? urlFor(article.mainImage).width(720).height(480).fit('crop').auto('format').url()
    : null

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const articleHref = `/articles/${cleanSlug}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surfaceRaised transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={articleHref} className="relative aspect-[16/10] w-full overflow-hidden bg-surfaceSunken">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={stegaClean(article.mainImage?.alt) || cleanTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primarySoft/60 text-primary">
            <span className="font-serif text-3xl font-bold opacity-30">Tibb-e-Unani</span>
          </div>
        )}
        {article.categories && article.categories.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {article.categories.map((cat) => (
              <span
                key={cat._id}
                className="rounded-full bg-surface/90 px-2.5 py-0.5 text-xs font-medium text-primary shadow-xs"
              >
                {stegaClean(cat.title)}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3 text-xs text-inkMuted">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {formattedDate}
            </span>
          )}
          {cleanAuthorName && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-secondary" />
              {cleanAuthorName}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-serif text-xl font-bold tracking-tight text-ink group-hover:text-primary transition-colors line-clamp-2">
          <Link href={articleHref}>
            {article.title}
          </Link>
        </h3>

        {cleanExcerpt && (
          <p className="mb-4 text-sm text-inkBody line-clamp-3 flex-1">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={articleHref}
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primaryHover"
          >
            Read Article &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}
