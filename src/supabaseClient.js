import { createClient } from '@supabase/supabase-js'

// Your new project URL
const supabaseUrl = 'https://gjlnkdnarvfnvjfkxttw.supabase.co'

// Your anon public key (copy from Supabase API page)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbG5rZG5hcnZmbnZqZmt4dHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTMxMDMsImV4cCI6MjA5NDA2OTEwM30.UHO29CEt8a0wuGm8xifCA2JUw-bs8dLnnz5_22kxSbw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)