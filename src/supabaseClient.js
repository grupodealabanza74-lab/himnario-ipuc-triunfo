import { createClient } from '@supabase/supabase-js'

// Tus llaves reales de Supabase
const supabaseUrl = 'https://pwyoeqcdvqhovszcwfzb.supabase.co'
const supabaseAnonKey = 'sb_publishable_ra8ERDcL9ultIafBMTTuzg_cMm1plgb'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)