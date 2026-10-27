# Email-Based 6-Digit Code Authentication for Verification and Password Reset

Status: accepted

Email verification and password reset previously relied on opaque URL tokens embedded in clickable links with long lifetimes (24 hours for email verification, 1 hour for password reset). While high-entropy link tokens protect well against brute force, enterprise email filters and security scanners (such as Microsoft Defender Safe Links) frequently pre-fetch GET links and consume single-use tokens prematurely, leaving patients with broken links upon arrival.

We decided to replace all link-based authentication flows with 6-digit numeric passkeys (Verification Code and Password Reset Code) powered by Better-Auth's `emailOTP` plugin with the following architecture:

- **5-minute expiration lifetime**: To prevent false expirations caused by real-world SMTP relay latency and Pakistani ISP greylisting (which frequently delay email delivery by 30 to 90 seconds), codes remain valid for 300 seconds rather than 2 minutes.
- **Cryptographic hashed storage**: Because 6-digit codes have low entropy ($10^6$ combinations), plain codes are never stored in the database. Better-Auth hashes codes at rest (`storeOTP: 'hashed'`).
- **Brute-force lockout & throttling**: Verification is permanently locked after 3 consecutive invalid attempts per code. Code generation is rate-limited on both client and server to once per 60 seconds with an immediate rotation strategy on resend.
- **Unified single-step password recovery**: Rather than a disconnected two-step dance, `/reset-password` accepts the 6-digit Password Reset Code, new password, and confirmation in a single atomic submission.
- **Total session revocation**: Completing a password reset immediately revokes all active sessions for that user across all devices, eliminating lingering compromised sessions.

Rejected alternatives:
- **Strict 2-minute expiration**: Rejected due to high drop-off and support burden from email queue and cellular delivery delays.
- **Plain-text OTP storage**: Rejected because database compromise or read leaks would expose active authentication codes.
- **Clickable verification links**: Rejected due to automated enterprise link scanners triggering false activations or consuming single-use tokens.

Consequence: Patients must copy or manually enter the 6 digits instead of a 1-click link click. To minimize friction, the email template renders a prominent monospace code card with bilingual (English + Urdu) expiration guidance, and the web input supports automatic clipboard paste and 6th-digit auto-submission.
