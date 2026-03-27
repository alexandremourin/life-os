import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqqpdbcjvaatelzxbnch.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcXBkYmNqdmFhdGVsenhibmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjMyNzYsImV4cCI6MjA4OTk5OTI3Nn0.gP4_xnf80hmXcKmArbFGtZrYfaIgWpgbtdKMIKYjAYM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
