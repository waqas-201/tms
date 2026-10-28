## Problem Statement

The clinic previously relied on a single hardcoded administrative email address configured in server environment variables. Anyone registering with that designated email address was automatically granted system-wide administrator privileges, and no secondary administrators could be provisioned. This caused significant operational hurdles:
1. Clinic operations could not be delegated among multiple staff members (handling orders, inventory adjustments, Hijama appointments, and consultation inquiries).
2. The system lacked distinction between sovereign platform governance (creating administrators, setting access policies) and day-to-day administrative operations.
3. If the administrator email needed to be changed or transferred, the system offered no secure in-app mechanism to reassign administrative control.
4. Hardcoding privileged credentials into environment configuration created a potential vulnerability if configuration files were inadvertently exposed or committed.

## Solution

Implement a complete, secure three-tier Role-Based Access Control (RBAC) hierarchy comprising:
1. **Super Admin**: The sole sovereign administrator with full authority across the clinic system, possessing exclusive rights to provision, deactivate, and delete up to three operational Admins, view administrative audit logs, and manage sovereign credentials via the protected Super Admin Cell.
2. **Admin**: Operational staff members capped at an Admin Quota of at most three concurrent active accounts, permitted to manage daily clinical operations (order fulfillment, catalog adjustments, consultation scheduling, Hijama bookings, and patient inquiries) without access to staff provisioning or Super Admin records.
3. **User**: Standard patient and customer accounts with access to public clinic and store features.

The initial Super Admin is established via a dedicated, unlinked setup interface using a single-use cryptographically generated Bootstrap Key that is permanently revoked and purged upon first redemption. Super Admin deletion is locked down so that no generic administrator or public endpoint can modify it; it can only be removed through the authenticated Super Admin Cell or direct database intervention.

## User Stories

1. As a clinic owner initializing a new deployment, I want a single-use Bootstrap Key generated during server setup, so that I can securely claim the Super Admin account without exposing credentials in code or environment variables.
2. As a clinic owner on the dedicated setup interface, I want to input the Bootstrap Key alongside my administrator details, so that I can claim the Super Admin role in an isolated environment away from public customer registration.
3. As a clinic owner submitting a valid Bootstrap Key, I want the key to be immediately revoked, consumed, and purged from the database, so that it can never be intercepted, reused, or replayed.
4. As an unauthorized user attempting to redeem an already-used or invalid Bootstrap Key, I want the system to reject the submission with an authentication error and audit the failed attempt, so that brute-force attempts are thwarted.
5. As an unauthorized visitor navigating to the setup interface after the Super Admin has already been claimed, I want to see an informational state indicating the system has already been initialized, so that I cannot submit rogue setup requests.
6. As the Super Admin, I want an exclusive staff management portal within the administrative console, so that I can oversee all operational Admin accounts from a central view.
7. As the Super Admin, I want to provision a new Admin with their full name, email, and temporary password, so that clinic staff can access the operational dashboard.
8. As the Super Admin, I want the system to enforce the Admin Quota of at most three active Admins, so that staff accounts cannot proliferate unchecked.
9. As the Super Admin viewing the staff management portal when three Admins are active, I want the "Create Admin" action to be visibly locked with an explanatory quota indicator, so that I clearly understand why additional accounts cannot be created.
10. As the Super Admin attempting to bypass UI controls and create a 4th Admin via the API, I want the request rejected with a quota-exceeded conflict error, so that the seat limit cannot be circumvented.
11. As the Super Admin, I want the ability to deactivate an existing Admin, so that former or reassigned staff immediately lose system access and free up quota for a replacement.
12. As the Super Admin, I want the ability to reactivate a previously deactivated Admin, provided the total active Admin count does not exceed three, so that staff returning from leave can regain access seamlessly.
13. As the Super Admin, I want the ability to permanently delete an Admin account and its associated session records, so that defunct accounts are purged from the system.
14. As a newly provisioned Admin, I want to log in using my credentials and access operational tools (order fulfillment, catalog adjustments, consultation scheduling, Hijama bookings), so that I can carry out daily clinic tasks.
15. As an operational Admin, I want attempts to navigate to the staff management portal or call admin-creation endpoints to be strictly blocked with a 403 Forbidden response, so that I cannot elevate privileges or create unauthorized accounts.
16. As an operational Admin, I want Super Admin profile records to be invisible in standard user listings and immune to modification or deletion, so that staff cannot tamper with sovereign leadership.
17. As an operational Admin, I want to manage my own password and profile details, so that I can maintain my credentials securely without needing Super Admin intervention for password updates.
18. As the Super Admin inside my private security settings ("Super Admin Cell"), I want the exclusive ability to initiate account removal or transfer to another verified email, so that platform governance can be cleanly handed over when necessary.
19. As the Super Admin performing an account removal or transfer within the Super Admin Cell, I want the system to require password re-authentication and confirmation, so that accidental or impulsive deletions are prevented.
20. As a clinic owner whose Super Admin credentials have been lost, I want direct database intervention to remain a valid out-of-band disaster recovery mechanism to re-assign or clear the Super Admin role, so that the clinic is never permanently locked out in an emergency.
21. As a standard customer registering on the public website, I want my account to default strictly to the `user` role regardless of input data, so that privilege escalation is prevented at the registration boundary.
22. As an authenticated session, I want my role permissions to be verified on every protected API route and server action, so that deactivated accounts or changed privileges take effect immediately without waiting for session expiry.
23. As a deactivated Admin attempting to make requests using a previously active session token, I want my requests to be immediately denied with an account suspended response, so that revoked staff cannot perform unauthorized actions.

## Implementation Decisions

- **Role Taxonomy Consolidation**: Consolidate system roles into three canonical tiers: `super_admin`, `admin`, and `user`. Retire legacy roles (`hakim`, `editor`, `contributor`), migrating back-office capabilities to `admin`.
- **Bootstrap Key Security and Persistence**: Store the single-use bootstrap key as a one-way cryptographic hash with metadata (`createdAt`, `consumedAt`, `redeemedBy`). Verification uses constant-time string comparison to resist timing attacks. Upon redemption in an atomic database transaction, update `consumedAt` and assign `role: "super_admin"` to the claimant.
- **Admin Quota Enforcement**: Enforce a transactional count constraint: active Admins cannot exceed three. Any provisioning attempt that would cause active Admins to exceed three is rejected with a 409 Conflict / Quota Exceeded error.
- **Hierarchical Authorization Guards**: Establish server-side authorization guards to enforce role hierarchy. Operations requiring staff management are gated strictly by `super_admin`, while daily operational endpoints accept either `super_admin` or `admin`. Public and customer-specific endpoints allow all active users.
- **Super Admin Cell Security**: Implement a dedicated self-service security compartment for the Super Admin account, isolated from standard profile editing, requiring credential verification prior to destructive actions.
- **Dedicated UI Surfaces**:
  - A standalone, non-indexed route exclusively for the one-time Bootstrap Key redemption and Super Admin provisioning.
  - A dedicated "Admin Team" management surface inside the back-office console, accessible exclusively to the Super Admin, presenting active Admin count against the 3-seat quota, account status toggles, and provisioning forms.
- **Deprecation of Hardcoded Bootstrap**: Completely remove legacy hardcoded bootstrap checks in authentication hooks that granted admin rights based on static email environment variables.

## Testing Decisions

- **Good Test Principle**: Tests must exercise external HTTP request boundaries (API endpoints and server actions) and verify end-to-end database state, without mocking authorization middleware or database transactions.
- **Modules Under Test**:
  - Bootstrap redemption endpoint: test valid key redemption, key invalidation/revocation on second attempt, invalid key rejection, and role assignment.
  - Admin management endpoints: test Super Admin creation of Admins 1, 2, and 3; rejection of 4th Admin due to Admin Quota; deactivation freeing quota; and non-super-admin 403 authorization rejection.
  - Super Admin deletion guardrails: test that standard Admins cannot delete or modify Super Admin, and test self-removal via Super Admin Cell with re-authentication.
  - Public registration boundary: test that public registration unconditionally assigns `user` role and ignores any injected role parameters.
  - Revocation enforcement: test that deactivating an admin immediately prevents subsequent API requests under their active session.
- **Prior Art**: Modeled after existing comprehensive test suites that validate database persistence, role guards, and session creation through direct HTTP execution.

## Out of Scope

- Granular custom permission matrix / custom permission builder per individual admin user.
- Expanding the Admin Quota beyond three concurrent active administrators.
- External enterprise SSO / SAML integration.
- Hardware key (WebAuthn/FIDO2) enforcement (standard password and email verification are used).

## Further Notes

- Fully aligned with the project domain glossary (canonical terms: **Super Admin**, **Admin**, **Bootstrap Key**, **Admin Quota**, and **Super Admin Cell**) and the corresponding architecture decision record on role hierarchy and bootstrap credentials.
- Legacy environment variable checks for bootstrap admin emails are deprecated and replaced.
