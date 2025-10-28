export interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token: string
}

export interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export function getGoogleAuthUrl() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
  }

  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}

export async function getGoogleTokens(code: string): Promise<GoogleTokenResponse> {
  const url = 'https://oauth2.googleapis.com/token'
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    grant_type: 'authorization_code',
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get tokens: ${error}`)
  }

  return response.json()
}

export async function getGoogleUser(access_token: string): Promise<GoogleUserInfo> {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}



