'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(errorParam.replace('_', ' '))
    }

    // Check if user is already logged in
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard')
        }
      })
  }, [router])

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-3xl">
        {/* Animated gradient bars - reference only, not shown */}
        <div className="hidden md:flex absolute z-[2] overflow-hidden backdrop-blur-2xl opacity-30">
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
          <div className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black to-transparent"></div>
        </div>

        {/* Decorative circles */}
        <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-[1] rounded-full bottom-0 left-0 opacity-20 animate-pulse"></div>
        <div className="w-[12rem] h-[12rem] bg-white absolute z-[1] rounded-full bottom-0 left-10 opacity-5"></div>
        <div className="w-[10rem] h-[10rem] bg-white absolute z-[1] rounded-full bottom-10 left-20 opacity-5"></div>

        {/* Left panel - Brand */}
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-t-3xl md:rounded-tr-none md:rounded-bl-3xl overflow-hidden">
          <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight mb-4">
              Master's Union
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Design and dev partner for startups and founders.
            </p>
          </div>
        </div>

        {/* Right panel - Login */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-10 rounded-b-3xl md:rounded-bl-none md:rounded-br-3xl">
          <div className="flex flex-col items-left mb-8">
            <div className="text-orange-500 mb-4 animate-pulse">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight text-gray-900">
              Get Started
            </h2>
            <p className="text-left text-gray-600">
              Welcome to Master's Union — Let's get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            </div>
          )}

          <form className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg px-6 py-3 font-medium hover:bg-gray-50 hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              <span>Secure and encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              <span>One-click authentication</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              <span>No password required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


