import type { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/live'
import { POSTS_QUERY } from '@/lib/sanity/queries'
import { ArticleCard } from '@/app/components/sanity/ArticleCard'
import type { SanityPost } from '@/lib/sanity/types'
import { BookOpen, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Articles & Tibbi Insights | Tameer-e-Sehat',
  description:
    'Explore classical Unani medicine wisdom, herbal remedies, lifestyle guides, and health research by experienced Hakeems from Matab Tameer-e-Sehat.',
  openGraph: {
    title: 'Articles & Tibbi Insights | Tameer-e-Sehat',
    description:
      'Explore classical Unani medicine wisdom, herbal remedies, lifestyle guides, and health research from Karachi, Pakistan.',
  },
}

export default async function ArticlesPage() {
  const { data: posts } = await sanityFetch<SanityPost[]>({
    query: POSTS_QUERY,
  })

  return (
    <div className="min-h-screen bg-surface">
      {/* Header section */}
      <section className="border-b border-line bg-gradient-to-b from-primarySoft/60 to-surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-surfaceRaised px-3.5 py-1 text-xs font-semibold text-secondaryText shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              <span>Tibbi Hikmat & Natural Remedies</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink md:text-5xl">
              Classical Wisdom & Herbal Health Articles
            </h1>
            <p className="mt-4 text-base text-inkBody md:text-lg">
              Insights, evidence-informed guidance, and traditional recipes curated by our experienced Hakeems to help you restore balance naturally.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts && Array.isArray(posts) && posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: SanityPost) => (
                <ArticleCard key={post._id} article={post} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-line bg-surfaceRaised p-8 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primarySoft text-primary">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">
                No Articles Published Yet
              </h3>
              <p className="mt-2 text-sm text-inkMuted">
                Articles published in the Sanity Studio will appear here automatically via real-time live content updates.
              </p>
              <div className="mt-6">
                <a
                  href="http://localhost:3333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primaryHover transition-colors"
                >
                  Open Sanity Studio
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
