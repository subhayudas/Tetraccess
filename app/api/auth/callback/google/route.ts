import { NextRequest, NextResponse } from 'next/server'
import { getGoogleTokens, getGoogleUser, getBaseUrl } from '@/lib/google-auth'
import { saveUserCredentials } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const baseUrl = getBaseUrl()

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code)
    console.log('✅ Successfully obtained OAuth tokens')
    
    // Get user info
    const userInfo = await getGoogleUser(tokens.access_token)
    console.log('✅ Successfully fetched user info for:', userInfo.email)

    // Save credentials to Supabase
    await saveUserCredentials({
      email: userInfo.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
    })
    console.log('✅ Successfully saved credentials to Supabase for:', userInfo.email)

    // Create session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`)
    
    // Store user session
    response.cookies.set('user_email', userInfo.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('user_name', userInfo.name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set('user_picture', userInfo.picture, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    const baseUrl = getBaseUrl()
    return NextResponse.redirect(
      `${baseUrl}/?error=authentication_failed`
    )
  }
}

