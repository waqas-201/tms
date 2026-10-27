# Technical Specification: Email-Based 6-Digit Code Authentication for Verification and Password Reset

**Target Project**: Tameer-e-Sehat (Unani Clinic & Apothecary)  
**Related ADR**: [0003-email-otp-authentication.md](file:///C:/Users/ALICOM4/projects/tms/docs/adr/0003-email-otp-authentication.md)  
**Vocabulary Reference**: [GLOSSARY.md](file:///C:/Users/ALICOM4/projects/tms/GLOSSARY.md)  
**Status**: ready-for-agent  

---

## 1. Problem Statement
Patients and clinical users currently verify their email address and reset passwords through long-lived clickable URL links sent via email. These links suffer from two critical failures:
1. Automated email security scanners and enterprise antispam firewalls pre-fetch GET links upon arrival, prematurely consuming single-use tokens and leaving patients with broken "invalid or expired link" errors.
2. If a patient initiates an action on one device (e.g. desktop browser) and opens the email on another (e.g. mobile phone), clicking the link creates a disconnected session on mobile rather than completing the flow on desktop where they began.

## 2. Solution
Replace link-based verification and password reset with single-use, 6-digit numeric passkeys (Verification Code and Password Reset Code). The patient receives a prominent 6-digit code in their email, valid for 5 minutes, which they can copy or type into a dedicated 6-cell segmented input component on the application, complete with brute-force lockout, rate limiting, and cascade session revocation.

## 3. User Stories
1. As a new patient registering an account, I want to receive a 6-digit Verification Code via email, so that I can activate my account without relying on link clicks.
2. As a patient with an enterprise email scanner, I want my verification email to contain a plain code rather than a clickable activation link, so that automated security bots cannot prematurely consume my token.
3. As a patient on a slow or cellular network, I want my Verification Code to remain valid for 5 minutes (300 seconds), so that normal delivery latency or server greylisting does not invalidate my code before I can enter it.
4. As a patient on the verification screen, I want to see a 6-box input that automatically advances focus as I type each digit, so that entering the code is fast and effortless.
5. As a patient copying a code from my email app, I want to paste the entire 6-digit code into any box and have all 6 inputs filled automatically, so that I do not have to type each digit manually.
6. As a patient entering the 6th digit, I want the form to submit automatically upon completion, so that I do not have to manually click a submit button.
7. As a patient who did not receive their code, I want a "Resend Code" button with a visible 60-second countdown timer, so that I know when I am eligible to request a fresh code without flooding my inbox.
8. As a patient requesting a new code, I want previous unexpired codes to be immediately invalidated upon re-issuance, so that there is never ambiguity about which code is active.
9. As a security-conscious patient, I want my Verification Codes stored only as cryptographic hashes in the clinic database, so that a database leak cannot expose active credentials.
10. As a clinic administrator, I want verification attempts locked after 3 consecutive incorrect guesses, so that malicious actors cannot brute-force 6-digit combinations.
11. As a newly verified patient, I want to be automatically logged in and redirected to my dashboard immediately after submitting a valid Verification Code, so that I do not have to type my credentials twice.
12. As a patient who previously placed guest orders or booked Hijama sessions, I want those guest records retro-linked to my profile immediately upon entering my Verification Code, so that my clinical history is unified.
13. As an unverified user attempting to sign in on `/login`, I want to be redirected to `/verify-email` with my email address pre-filled, so that I can easily complete account activation.
14. As a patient who forgot my password, I want to enter my email on `/forgot-password` and receive a 6-digit Password Reset Code, so that I can securely regain access.
15. As a patient on `/reset-password`, I want to enter my 6-digit Password Reset Code, new password, and password confirmation on a single screen, so that I do not have to navigate multiple intermediate confirmation pages.
16. As an account holder completing a password reset, I want all active sessions across all devices to be immediately terminated, so that any unauthorized active logins are kicked out.
17. As an Urdu-speaking or bilingual patient, I want the email notifications to clearly indicate in both English and Urdu that the code is valid for 5 minutes, so that I understand the expiration timeframe.

## 4. Implementation Decisions
- **Better-Auth Plugin Integration**: Integrate Better-Auth's official `emailOTP` plugin into `lib/auth.ts` and `lib/auth-client.ts`, enabling `sendVerificationOTP`, `sendResetPasswordOTP`, and configuring `overrideDefaultEmailVerification: true`.
- **Hashed Storage & Lifetimes**: Set `storeOTP: "hashed"`, `expiresIn: 300` (5 minutes), and `allowedAttempts: 3` in the plugin configuration.
- **Resend Email Templates**: Refactor verification and password reset dispatchers in `lib/email.ts` to output large-format `32px` letter-spaced monospace digits inside a high-contrast copyable container with bilingual expiry copy, removing legacy link buttons.
- **Segmented Input Component**: Implement a reusable 6-cell digit input supporting keyboard arrow navigation, backspace deletion, clipboard paste auto-population, and `onComplete` trigger.
- **Atomic Password Reset**: Build `/reset-password` around `authClient.emailOtp.resetPassword({ email, otp, password })`.
- **Session Revocation**: Leverage Better-Auth's session revocation hook to purge all active session rows for the target user ID upon successful password reset.

## 5. Testing Decisions
- **Good Test Principle**: Tests must exercise external system boundaries via API endpoints and database state assertions, without mocking internal helper routines.
- **Module Under Test**: Better-Auth configuration, Resend email dispatch formatting, and API routes (`/api/auth/email-otp/*`).
- **Prior Art**: Extend existing test suites in `scripts/test-auth-flows.ts` (`npm run test:auth`) which already validates database persistence, role guards, and session creation.

## 6. Out of Scope
- SMS / WhatsApp OTP delivery (telephony gateways like Twilio or Jazz/Telenor SMS are out of scope; email delivery via Resend is the sole channel).
- Multi-factor authentication (MFA / 2FA) on regular password sign-ins.
- Modifying session duration or cookie policy for standard authenticated logins.

## 7. Further Notes
- Replaces legacy link-based parameters (`?token=...`) across verification routes.
- Fully aligned with `GLOSSARY.md` (canonical terms: **Verification Code** and **Password Reset Code**) and `docs/adr/0003-email-otp-authentication.md`.
