# Email & Auth Email Troubleshooting

Transactional email (verification, password reset, order/booking confirmations) is
sent through [Resend](https://resend.com). This page records the failure mode that
broke signup verification and how to check it.

## Symptom

- Sign-up appears to succeed, but the verification email never arrives for anyone
  except the Resend account owner.
- Vercel runtime logs show `POST /api/auth/send-verification-email` returning
  `[Email Verification Dispatch Error]` with:

  ```
  {
    message: "You can only send testing emails to your own email address (…). To send
              emails to other recipients, please verify a domain at resend.com/domains,
              and change the `from` address to an email using this domain.",
    name: 'validation_error',
    statusCode: 403
  }
  ```

- Users who never verified cannot sign in (`EMAIL_NOT_VERIFIED`), so the whole
  login flow looks broken for those addresses.

## Root cause

`EMAIL_FROM` was set to `Tameer-e-Sehat <onboarding@resend.dev>` — Resend's shared
sandbox sender. Resend only allows that sender to deliver to the account owner's own
address; every other recipient is rejected with HTTP 403 at the API level, before
any mail is queued.

## Fix

1. Send from an address on the verified domain:

   ```
   EMAIL_FROM="Tameer-e-Sehat <noreply@tameeresehat.com>"
   ```

   Set this in Vercel for **Production**, **Preview** and **Development**, and in
   local `.env` / `.env.local`. Changing it requires a new deployment.

2. `lib/email.ts` no longer defaults to the sandbox sender, and logs a warning if
   `EMAIL_FROM` still contains `resend.dev` in production.

3. Admin notification emails fall back to `ADMIN_EMAIL` (not `EMAIL_FROM`), so alerts
   are not sent to the no-reply address.

## Verifying

- Domain records: `GET https://api.resend.com/domains` — `status` must be `verified`.
- Recent sends: `GET https://api.resend.com/emails` — check `last_event`
  (`delivered` / `bounced` / `suppressed`).
- Live logs: `vercel logs --deployment <deployment> --environment production --json`
  and look for `/api/auth/` entries.

## Domain setup (tameeresehat.com)

DNS is managed by Vercel (`vercel dns list tameeresehat.com`). Resend needs:

| Record | Name | Type | Value |
| --- | --- | --- | --- |
| DKIM | `resend._domainkey` | TXT | `p=MIGf…` |
| SPF / bounce | `send` | CNAME | `send.forge.rmta.net` |
| SPF / DMARC alignment | `rsend` | CNAME | `rsend-apne1.forge.rmta.net` |
| Receiving | `@` | MX 10 | `inbound-smtp.ap-northeast-1.amazonaws.com` |

The MX record is only needed for **inbound** mail. Without it Resend reports the
domain as `partially_failed` (sending still works) and nothing sent *to*
`@tameeresehat.com` is delivered anywhere.

## Notes

- `EMAIL_REPLY_TO` is optional. Only set it once the domain can actually receive
  mail, otherwise patient replies bounce.
- If the domain is ever re-verified and Resend briefly reports
  `pending`/`failed`, sending can return 403 until the check completes (usually
  minutes). Re-check `GET /domains` before assuming the app is broken.
