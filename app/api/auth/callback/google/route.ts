import { NextRequest, NextResponse } from 'next/server'
import { getGoogleTokens, getGoogleUser, getBaseUrl } from '@/lib/google-auth'
import { saveUserCredentials } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔐 OAuth callback received')
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const baseUrl = getBaseUrl()
  
  console.log('📋 Callback parameters:', {
    hasCode: !!code,
    hasError: !!error,
    baseUrl
  })

  if (error) {
    console.error('❌ OAuth error from Google:', error)
    return NextResponse.redirect(`${baseUrl}/?error=${error}`)
  }

  if (!code) {
    console.error('❌ No authorization code received')
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }
  
  console.log('✅ Authorization code received')

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code)
    console.log('✅ Successfully obtained OAuth tokens')
    
    // Get user info
    const userInfo = await getGoogleUser(tokens.access_token)
    console.log('✅ Successfully fetched user info for:', userInfo.email)

    // Save credentials to Supabase
    try {
      await saveUserCredentials({
        email: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
      })
      console.log('✅ Successfully saved credentials to Supabase for:', userInfo.email)
    } catch (dbError: any) {
      console.error('❌ Error saving to database:', dbError)
      // Check if it's a table/column issue
      if (dbError.code === '42P01') {
        console.error('❌ Table does not exist. Please run the schema setup.')
      }
      throw dbError
    }

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
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error)
    console.error('Error stack:', error.stack)
    
    // Log the specific error details
    if (error.message) {
      console.error('Error message:', error.message)
    }
    
    const baseUrl = getBaseUrl()
    
    // Redirect with specific error message
    const errorMessage = error.message || 'authentication_failed'
    console.error(`Redirecting to ${baseUrl}/?error=${errorMessage}`)
    
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(errorMessage)}`
    )
  }
}

