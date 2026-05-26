import { NextRequest, NextResponse } from 'next/server'

// Redirect to the client-side callback page which exchanges the PKCE code
// using the browser Supabase client (session stored in localStorage)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}&next=${next}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
