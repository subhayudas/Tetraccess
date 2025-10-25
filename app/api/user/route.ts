import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const email = request.cookies.get('user_email')?.value
  const name = request.cookies.get('user_name')?.value
  const picture = request.cookies.get('user_picture')?.value

  if (!email) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      email,
      name,
      picture,
    },
  })
}


