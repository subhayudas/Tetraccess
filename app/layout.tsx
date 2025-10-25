import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Master's Union - Google OAuth Login",
  description: 'Secure authentication with Google OAuth 2.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


