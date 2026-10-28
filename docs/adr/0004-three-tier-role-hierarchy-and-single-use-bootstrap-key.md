# Three-Tier Role Hierarchy and Single-Use Bootstrap Key

Status: accepted

Previously, administrative access was tied to a hardcoded bootstrap email address in environment configuration (`ADMIN_EMAIL`), which automatically conferred the `admin` role upon registration. This prevented multi-admin clinic operations, lacked privilege segregation between system governance and operational duties, and created a security vulnerability if the environment variable was leaked or misconfigured.

We decided to replace the hardcoded admin system with a strict three-tier role-based access control architecture (`super_admin`, `admin`, and `user`) with the following mechanisms:

- **Single-Use Bootstrap Key**: The initial Super Admin account is provisioned through an isolated setup interface (`/setup/super-admin`) requiring a single-use cryptographically secure bootstrap key generated once on the server. Upon successful account creation, the key is permanently revoked, consumed, and purged from the database, preventing reuse or replay attacks.
- **Strict Admin Quota**: The Super Admin can provision sub-admins from a dedicated management interface, strictly capped at a maximum of three concurrent active Admin accounts. This constraint is enforced at both the API and database levels to prevent administrative bloat and rogue account proliferation.
- **Role Isolation & Separation of Duties**: Regular Admins are granted full operational privileges (managing orders, dispensary inventory, Hijama appointments, clinical inquiries, and customer records) but are strictly forbidden from viewing, provisioning, modifying, or deleting other administrative staff.
- **Super Admin Self-Removal & Protection**: No generic API route or standard admin can modify or delete the Super Admin. The only software path to remove or transfer the Super Admin role is through the Super Admin's private security compartment ("Super Admin Cell") requiring explicit re-authentication, or via direct manual database intervention by the database administrator.

Considered Options:
- **Retaining Environment-Variable Bootstrap (`ADMIN_EMAIL`)**: Rejected because it hardcodes ownership to a static email string and cannot securely scale to multi-operator clinic staffing.
- **Uncapped Admin Roles**: Rejected to enforce strict operational oversight and prevent unauthorized creation of privileged accounts.
- **Multi-Role Matrix (`editor`, `contributor`, `hakim`)**: Deferred in favor of a lean three-role hierarchy matching current clinic organizational reality without unnecessary role bloat.
