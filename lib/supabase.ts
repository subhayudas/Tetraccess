import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for public operations (client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
// This should only be used in API routes, never on the client
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Database writes may fail.')
}

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client if service key not available

export interface TetraccessData {
  id?: string
  email: string
  access_token: string | null
  refresh_token: string | null
  created_at?: string
  updated_at?: string
}

export async function saveUserCredentials(data: TetraccessData) {
  console.log('💾 Attempting to save credentials for:', data.email)
  
  // Use admin client to bypass RLS (this runs on server-side only)
  const { data: result, error } = await supabaseAdmin
    .from('MU_data')
    .upsert(
      {
        email: data.email,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      },
      {
        onConflict: 'email',
      }
    )

  if (error) {
    console.error('❌ Error saving credentials:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw error
  }

  console.log('✅ Successfully saved credentials')
  return { success: true }
}

export async function getUserCredentials(email: string) {
  // Use admin client to bypass RLS (this runs on server-side only)
  const { data, error } = await supabaseAdmin
    .from('MU_data')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Error fetching credentials:', error)
    throw error
  }

  return data
}

