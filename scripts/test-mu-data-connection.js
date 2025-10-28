// Script to test MU_data table connection
// Run with: node scripts/test-mu-data-connection.js

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function testMUDatabaseConnection() {
  console.log('🔍 Testing MU_data table connection...\n')

  // Verify environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
    process.exit(1)
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`   Supabase URL: ${supabaseUrl}`)
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: Check if table exists by querying it
    console.log('\n📋 Test 1: Checking if MU_data table exists...')
    const { data, error } = await supabase
      .from('MU_data')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table MU_data does not exist!')
        console.error('   Please run the SQL setup script in Supabase SQL Editor')
      } else {
        console.error('❌ Error querying table:', error.message)
        console.error('   Error code:', error.code)
        console.error('   Error details:', error.details)
        console.error('   Error hint:', error.hint)
      }
    } else {
      console.log('✅ Table MU_data exists and is accessible')
      console.log(`   Found ${data ? data.length : 0} record(s)`)
    }

    // Test 2: Try to insert a test record
    console.log('\n💾 Test 2: Testing insert operation...')
    const testEmail = `test-${Date.now()}@example.com`
    const { data: insertData, error: insertError } = await supabase
      .from('MU_data')
      .insert({
        email: testEmail,
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
      })
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message)
      console.error('   Error code:', insertError.code)
      console.error('   Error details:', insertError.details)
      console.error('   Error hint:', insertError.hint)
    } else {
      console.log('✅ Insert successful')
      console.log('   Test record created:', insertData)

      // Clean up test record
      console.log('\n🧹 Cleaning up test record...')
      const { error: deleteError } = await supabase
        .from('MU_data')
        .delete()
        .eq('email', testEmail)

      if (deleteError) {
        console.error('⚠️  Could not delete test record:', deleteError.message)
      } else {
        console.log('✅ Test record deleted')
      }
    }

    // Test 3: Try upsert operation
    console.log('\n🔄 Test 3: Testing upsert operation...')
    const upsertEmail = `test-upsert-${Date.now()}@example.com`
    const { data: upsertData, error: upsertError } = await supabase
      .from('MU_data')
      .upsert({
        email: upsertEmail,
        access_token: 'test_upsert_token',
        refresh_token: 'test_upsert_refresh'
      }, {
        onConflict: 'email'
      })
      .select()

    if (upsertError) {
      console.error('❌ Upsert failed:', upsertError.message)
      console.error('   Error code:', upsertError.code)
    } else {
      console.log('✅ Upsert successful')
    }

    // Clean up
    await supabase
      .from('MU_data')
      .delete()
      .eq('email', upsertEmail)

    console.log('\n✅ All tests completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

testMUDatabaseConnection()

