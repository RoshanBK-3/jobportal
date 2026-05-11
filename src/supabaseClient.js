import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjlnkdnarvfnvjfkxttw.supabase.co'
const supabaseAnonKey = 'sb_publishable_790am5io4zUiemD1b0ATeg_gnCZO86l'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)