import { PortableText, type PortableTextComponents, type PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import { urlFor } from '@/lib/sanity/image'

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const imageUrl = urlFor(value).width(1200).fit('max').auto('format').url()
      const cleanAlt = stegaClean(value.alt) || 'Article visual'
      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-line bg-surfaceSunken/50">
          <div className="relative aspect-video w-full">
            <Image
              src={imageUrl}
              alt={cleanAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
            />
          </div>
          {value.caption && (
            <figcaption className="p-3 text-center text-xs text-inkMuted italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 font-serif text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-serif text-xl font-semibold text-ink md:text-2xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 font-serif text-lg font-semibold text-ink">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-base leading-relaxed text-inkBody">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-inkMuted bg-primarySoft/40 py-2 rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-surfaceSunken px-1.5 py-0.5 font-mono text-sm text-primary">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const rawHref = value?.href || '#'
      const href = stegaClean(rawHref)
      const isExternal = href.startsWith('http://') || href.startsWith('https://')
      return (
        <Link
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primaryHover hover:decoration-primary"
        >
          {children}
        </Link>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-inkBody">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-inkBody">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
}

export function CustomPortableText({ value }: { value?: PortableTextBlock[] | null }) {
  if (!value || !Array.isArray(value) || value.length === 0) return null
  return <PortableText value={value} components={portableTextComponents} />
}
