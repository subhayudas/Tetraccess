// Script to verify all environment variables are set correctly
// Run with: node scripts/verify-env.js

require('dotenv').config({ path: '.env' })

const requiredVars = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', example: 'https://xxxxx.supabase.co' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', example: 'eyJhbGci...' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', example: 'eyJhbGci...' },
  { key: 'GOOGLE_CLIENT_ID', example: '123456789.apps.googleusercontent.com' },
  { key: 'GOOGLE_CLIENT_SECRET', example: 'GOCSPX-xxxxx' },
  { key: 'NEXTAUTH_SECRET', example: 'generated-with-openssl' },
  { key: 'NEXTAUTH_URL', example: 'http://localhost:3000' },
]

console.log('🔍 Checking Environment Variables...\n')

let allPresent = true
let warnings = []

requiredVars.forEach(({ key, example }) => {
  const value = process.env[key]
  
  if (!value || value.includes('your-') || value.includes('generate-one')) {
    console.log(`❌ ${key}`)
    console.log(`   Example: ${example}\n`)
    allPresent = false
  } else {
    console.log(`✅ ${key}`)
    
    // Additional validation
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !value.includes('supabase.co')) {
      warnings.push(`⚠️  ${key} might be incorrect (should contain 'supabase.co')`)
    }
    if (key === 'GOOGLE_CLIENT_ID' && !value.includes('.apps.googleusercontent.com')) {
      warnings.push(`⚠️  ${key} might be incorrect (should end with '.apps.googleusercontent.com')`)
    }
    if (key === 'NEXTAUTH_SECRET' && value.length < 32) {
      warnings.push(`⚠️  ${key} should be at least 32 characters for security`)
    }
  }
})

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach(w => console.log(w))
}

if (!allPresent) {
  console.log('\n❌ Some environment variables are missing or not configured.')
  console.log('   Please update your .env file with the correct values.\n')
  process.exit(1)
} else {
  console.log('\n✅ All environment variables are set!\n')
  console.log('Next steps:')
  console.log('1. Run: node scripts/test-supabase.js (to test database connection)')
  console.log('2. Run: npm run dev (to start the app)\n')
}


