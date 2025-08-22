import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connected successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
