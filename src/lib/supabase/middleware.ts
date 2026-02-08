
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            
            supabaseResponse = NextResponse.next({
              request,
            })
            
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    await supabase.auth.getUser()

    return supabaseResponse
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because the cookie is invalid.
    // Instead of crashing, we return the initial response, effectively signing out the user
    // or treating them as anonymous.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
