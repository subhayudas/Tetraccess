import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear all auth cookies
  response.cookies.delete('user_email')
  response.cookies.delete('user_name')
  response.cookies.delete('user_picture')
  
  return response
}



