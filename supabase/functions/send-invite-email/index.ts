import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type InviteRow = {
  id: string
  email: string
  role: string
  invited_by: string
  trip_id: string
  trips: {
    name: string
    destination: string | null
    starts_on: string | null
    ends_on: string | null
  }
}

type InviterProfile = {
  display_name: string | null
  email: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const appUrl = Deno.env.get('APP_URL') ?? 'https://aaronbenjaminmay.github.io/Maycation-Planner'
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'Maycation <noreply@maycation.app>'

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      console.error('send-invite-email: auth failed', { authError })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const { inviteId } = await req.json() as { inviteId: string }
    if (!inviteId) {
      console.error('send-invite-email: missing inviteId', { userId: user.id })
      return new Response(JSON.stringify({ error: 'inviteId is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: invite, error: inviteError } = await serviceClient
      .from('trip_invites')
      .select(`
        id,
        email,
        role,
        invited_by,
        trip_id,
        trips!inner (
          name,
          destination,
          starts_on,
          ends_on
        )
      `)
      .eq('id', inviteId)
      .eq('status', 'pending')
      .single<InviteRow>()

    if (inviteError || !invite) {
      console.error('send-invite-email: invite not found', { inviteId, userId: user.id, inviteError })
      return new Response(JSON.stringify({ error: 'Invite not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    if (invite.invited_by !== user.id) {
      console.error('send-invite-email: forbidden', { inviteId, invitedBy: invite.invited_by, userId: user.id })
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const { data: inviterProfile, error: profileError } = await serviceClient
      .from('profiles')
      .select('display_name, email')
      .eq('user_id', invite.invited_by)
      .single<InviterProfile>()

    if (profileError) {
      console.error('send-invite-email: profile lookup failed', { userId: invite.invited_by, profileError })
    }

    const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'A trip owner'
    const trip = invite.trips
    const roleLabel = invite.role === 'editor' ? 'editor' : 'viewer'

    const tripMeta = [formatDateRange(trip.starts_on, trip.ends_on), trip.destination]
      .filter(Boolean)
      .join(' · ')

    const emailHtml = buildInviteEmail({
      inviterName,
      tripName: trip.name,
      tripMeta,
      inviteeEmail: invite.email,
      roleLabel,
      appUrl,
    })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: invite.email,
        subject: `You're invited to join ${trip.name} on Maycation`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Resend error', { status: res.status, body })
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    await serviceClient
      .from('trip_invites')
      .update({ last_sent_at: new Date().toISOString() })
      .eq('id', inviteId)

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-invite-email error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})

function formatDateRange(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn || !endsOn) return ''

  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const start = fmt.format(new Date(`${startsOn}T00:00:00`))
  const end = fmt.format(new Date(`${endsOn}T00:00:00`))

  return `${start} – ${end}`
}

type EmailParams = {
  inviterName: string
  tripName: string
  tripMeta: string
  inviteeEmail: string
  roleLabel: string
  appUrl: string
}

function buildInviteEmail({
  inviterName,
  tripName,
  tripMeta,
  inviteeEmail,
  roleLabel,
  appUrl,
}: EmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${escapeHtml(tripName)}</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#121316;border:1px solid #2b2d32;border-radius:16px;overflow:hidden;">

          <tr>
            <td style="padding:32px 32px 0;">
              <p style="margin:0 0 24px;color:#35b8a8;font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">Maycation</p>
              <h1 style="margin:0 0 8px;color:#f5f7fb;font-size:22px;font-weight:900;line-height:1.2;">You're invited</h1>
              <p style="margin:0 0 24px;color:#b6bfcc;font-size:15px;line-height:1.5;">
                ${escapeHtml(inviterName)} has invited you to join a trip on Maycation.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#a1a1a6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Trip</p>
                    <p style="margin:0 0 16px;color:#f5f7fb;font-size:18px;font-weight:900;">${escapeHtml(tripName)}</p>
                    ${tripMeta ? `<p style="margin:0 0 16px;color:#b6bfcc;font-size:13px;">${escapeHtml(tripMeta)}</p>` : ''}
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 10px;background:rgba(53,184,168,0.12);border:1px solid rgba(53,184,168,0.3);border-radius:999px;">
                          <span style="color:#35b8a8;font-size:11px;font-weight:700;text-transform:capitalize;">${escapeHtml(roleLabel)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;color:#b6bfcc;font-size:13px;line-height:1.5;">
                This invite was sent to <strong style="color:#f5f7fb;">${escapeHtml(inviteeEmail)}</strong>.
                Sign in to Maycation with this email to accept.
              </p>
              <a href="${appUrl}" style="display:inline-block;padding:14px 28px;background:#35b8a8;border-radius:999px;color:#061312;font-size:14px;font-weight:900;text-decoration:none;">
                Open Maycation
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2b2d32;">
              <p style="margin:0;color:#a1a1a6;font-size:12px;line-height:1.6;">
                This invite expires in 14 days. If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
