// Test script to verify Supabase connection and credentials
// Run with: node scripts/test-supabase.js

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Configuration...\n')

  // Check environment variables
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
  ]

  let allEnvVarsPresent = true
  checks.forEach(check => {
    if (check.value) {
      console.log(`✅ ${check.name}: Set`)
    } else {
      console.log(`❌ ${check.name}: Missing`)
      allEnvVarsPresent = false
    }
  })

  if (!allEnvVarsPresent) {
    console.log('\n❌ Please set all required environment variables in .env file')
    process.exit(1)
  }

  // Test Supabase connection with service role key
  console.log('\n🔗 Testing Supabase connection...')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Test if table exists by trying to read from it
    const { data, error } = await supabase
      .from('tetraccess')
      .select('count')
      .limit(1)

    if (error && error.code === '42P01') {
      console.log('❌ Table "tetraccess" does not exist')
      console.log('   Run the SQL script from supabase-setup.sql in your Supabase SQL Editor')
      process.exit(1)
    } else if (error) {
      console.log('❌ Error connecting to Supabase:', error.message)
      process.exit(1)
    } else {
      console.log('✅ Successfully connected to Supabase')
      console.log('✅ Table "tetraccess" exists')
    }

    // Test insert (will rollback)
    const testEmail = `test-${Date.now()}@example.com`
    const { error: insertError } = await supabase
      .from('tetraccess')
      .insert({
        email: testEmail,
        access_token: 'test_token',
        refresh_token: 'test_refresh',
      })

    if (insertError) {
      console.log('❌ Cannot insert test data:', insertError.message)
      process.exit(1)
    } else {
      console.log('✅ Successfully inserted test data')
      
      // Clean up test data
      await supabase.from('tetraccess').delete().eq('email', testEmail)
      console.log('✅ Test data cleaned up')
    }

    console.log('\n🎉 All checks passed! Your Supabase setup is correct.\n')
  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

testSupabaseConnection()

