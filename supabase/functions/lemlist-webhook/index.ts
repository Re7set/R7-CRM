import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify webhook secret
  const webhookSecret = req.headers.get('x-webhook-secret')
  const expectedSecret = Deno.env.get('LEMLIST_WEBHOOK_SECRET')
  if (expectedSecret && webhookSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()

    // Lemlist sends: email, firstName, lastName, companyName, campaignId, etc.
    const {
      email = '',
      firstName = '',
      lastName = '',
      companyName = '',
      campaignId = '',
      campaignName = '',
    } = body

    const dealName = companyName || `${firstName} ${lastName}`.trim() || email

    // Look up or create client by company name
    let clientId: string | null = null
    if (companyName) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .ilike('name', companyName)
        .limit(1)
        .single()

      if (existing) {
        clientId = existing.id
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({ name: companyName, email, status: 'prospect' })
          .select('id')
          .single()
        clientId = newClient?.id ?? null
      }
    }

    // Look up assignment rules for "Réponse positive" stage
    const { data: rules } = await supabase
      .from('assignment_rules')
      .select('team_member_id')
      .eq('stage', 'Réponse positive')
      .eq('is_active', true)
      .limit(1)

    const assignedTo = rules?.[0]?.team_member_id ?? null

    // Create deal
    const { data: deal, error: dealErr } = await supabase
      .from('deals')
      .insert({
        name: dealName,
        stage: 'Réponse positive',
        source: 'cold_email',
        warm_status: 'replied',
        client_id: clientId,
        assigned_to: assignedTo,
        lemlist_campaign_id: campaignId,
        value: 0,
        mrr: 0,
        mrr_cible: 0,
        probability: 10,
      })
      .select('id, name')
      .single()

    if (dealErr) throw dealErr

    // Create activity
    await supabase.from('activities').insert({
      type: 'lemlist_email',
      description: `Réponse positive via Lemlist${campaignName ? ` (${campaignName})` : ''}`,
      deal_id: deal.id,
      client_id: clientId,
    })

    // Create notification for assigned team member
    if (assignedTo) {
      await supabase.from('notifications').insert({
        team_member_id: assignedTo,
        deal_id: deal.id,
        title: 'Nouveau lead Lemlist',
        body: dealName,
      })
    }

    return new Response(
      JSON.stringify({ success: true, deal_id: deal.id, deal_name: deal.name }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
