// Supabase deprecated: kept as stub to avoid breaking imports during migration
export interface SignupData {
  name: string
  email: string
  phone: string
  package_name: string
}

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

export async function saveToSupabase(_data: SignupData): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}