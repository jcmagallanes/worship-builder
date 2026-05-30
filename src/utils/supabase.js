import { createClient } from '@supabase/supabase-js'

// These are replaced with your actual Supabase project values
// See README for setup instructions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export const isSupabaseConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY)

// ── Set operations ─────────────────────────────────────────────

export async function createSet({ title, songs }) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('sets')
    .insert({ title, songs })
    .select('id, edit_token')
    .single()
  if (error) throw error
  return data // { id, edit_token }
}

export async function getSet(id) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('sets')
    .select('id, title, songs, updated_at')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateSet(id, editToken, { title, songs }) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('sets')
    .update({ title, songs, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('edit_token', editToken)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export function subscribeToSet(id, callback) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`set:${id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sets',
      filter: `id=eq.${id}`,
    }, (payload) => {
      callback(payload.new)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
