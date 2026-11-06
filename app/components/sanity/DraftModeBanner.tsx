import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'

export async function DraftModeBanner() {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  return (
    <>
      <VisualEditing />
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full border border-emerald-600 bg-emerald-950/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Sanity Visual Editing & Live Draft Active</span>
        <a
          href="/api/draft-mode/disable"
          className="ml-2 rounded-sm bg-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-700 transition-colors"
        >
          Exit Preview
        </a>
      </div>
    </>
  )
}
