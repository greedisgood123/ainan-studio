import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://klgkglipbaqwotcbartf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZ2tnbGlwYmFxd290Y2JhcnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTQ1MjAsImV4cCI6MjA2MTczMDUyMH0.0JPyMJmk1ffDd6Q77kZvzuKHHn7rGR2xbl27bau4VGQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface SignupData {
  name: string
  email: string
  phone: string
  package_name: string
}

// Function to save signup data to Supabase
export async function saveToSupabase(data: SignupData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('signups')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        package_name: data.package_name,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}