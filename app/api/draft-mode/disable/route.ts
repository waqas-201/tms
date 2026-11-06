import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  // Safely redirect back to referer if it matches same origin, otherwise default to home
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      if (refererUrl.origin === request.nextUrl.origin) {
        return NextResponse.redirect(refererUrl)
      }
    } catch {
      // Ignore malformed referer
    }
  }

  return NextResponse.redirect(new URL('/', request.nextUrl.origin))
}
