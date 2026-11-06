import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import { sanityFetch } from '@/lib/sanity/live'
import { ACTIVE_ANNOUNCEMENTS_QUERY } from '@/lib/sanity/queries'
import type { SanityAnnouncement } from '@/lib/sanity/types'
import { Bell, ArrowRight } from 'lucide-react'

export async function AnnouncementBanner() {
  const { data: announcements } = await sanityFetch<SanityAnnouncement[]>({
    query: ACTIVE_ANNOUNCEMENTS_QUERY,
  })

  if (!announcements || !Array.isArray(announcements) || announcements.length === 0) {
    return null
  }

  const announcement = announcements[0]
  if (!announcement || announcement.active === false) {
    return null
  }

  const cleanPriority = stegaClean(announcement.priority) || 'normal'
  const cleanLink = announcement.link ? stegaClean(announcement.link) : null

  const priorityStyles: Record<string, string> = {
    high: 'bg-danger text-white border-b border-dangerSoft',
    info: 'bg-primary text-white border-b border-primaryHover',
    normal: 'bg-secondary/15 text-ink border-b border-secondary/30',
  }

  const activeStyle = priorityStyles[cleanPriority] || priorityStyles.normal

  return (
    <aside aria-label="Announcement" className={`${activeStyle} px-4 py-2 text-xs md:text-sm font-medium transition-colors`}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Bell className="h-4 w-4 shrink-0" />
        <span className="font-semibold">{announcement.title}:</span>
        <span className="opacity-95">{announcement.message}</span>
        {cleanLink && (
          <Link
            href={cleanLink}
            className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:opacity-80"
          >
            Learn more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </aside>
  )
}
