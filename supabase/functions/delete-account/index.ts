// Edge Function: permanently deletes the signed-in person's account.
//
// Deleting the auth user also deletes everything that belongs to it: every
// table references auth.users with "on delete cascade".

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: userData, error: userError } = await admin.auth.getUser(token)
    if (userError || !userData.user) return json({ error: 'You must be signed in.' }, 401)

    const { error } = await admin.auth.admin.deleteUser(userData.user.id)
    if (error) {
      console.error('Could not delete user', error)
      return json({ error: 'The account could not be deleted. Try again.' }, 500)
    }
    return json({ deleted: true })
  } catch (err) {
    console.error(err)
    return json({ error: 'Something went wrong.' }, 500)
  }
})
