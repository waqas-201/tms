# Tameer-e-Sehat

Tameer-e-Sehat is a classical Unani and herbal healthcare clinic and e-commerce apothecary based in Karachi, Pakistan, providing traditional holistic remedies, clinical consultations, and Islamic therapeutics.

## Language

**Hijama**:
Therapeutic wet cupping involving sterile suction and superficial micro-incisions to draw stagnant blood and toxins.
_Avoid_: Cupping therapy, bloodletting

**Sunnah Days**:
The 17th, 19th, and 21st days of the Islamic lunar (Hijri) month, traditionally designated for optimal Hijama treatment.
_Avoid_: Peak days, Islamic dates, lucky days

**Hijama Booking**:
A reserved appointment for a patient to receive Hijama treatment at the physical clinic on a specific calendar date and time slot.
_Avoid_: Consultation, order, appointment request

**Booking Reference**:
A unique alphanumeric ticket number (e.g. `HIJ-2026-4821`) issued to the patient upon successful reservation.
_Avoid_: Order number, token, tracking ID

**Seat Capacity**:
The maximum number of concurrent patients an admin permits for a given time window or Hijama session.
_Avoid_: Ticket limit, quota, stock

**Hajjam / Hajjama**:
A certified Islamic cupping practitioner (Hajjam for male patients, Hajjama for female patients).
_Avoid_: Doctor, therapist, nurse

**Moon-Sighting Offset**:
An administrative adjustment knob (-2 to +2 days) to synchronize the astronomical Hijri lunar calendar with local Pakistani Central Ruet-e-Hilal moon-sighting declarations.
_Avoid_: Timezone shift, delay, date fix

**Consultation Request**:
An inquiry submitted by a patient seeking holistic Unani medical guidance, dietary assessment, or herbal treatment from Hakeem Tahir Hameed, conducted either via Instant WhatsApp or an In-Person Clinic Visit.
_Avoid_: Order, appointment booking (unless In-Person), customer ticket

**Consultation Ticket**:
A unique alphanumeric tracking identifier (e.g. `CON-2026-8921`) issued to a patient for their Unani clinical inquiry or appointment.
_Avoid_: Order ID, receipt number, serial number

**Medical Report Attachment**:
A patient-provided diagnostic document (lab test, prescription, or clinical photo) securely hosted and linked to their consultation dossier.
_Avoid_: Generic upload, file link, asset

**Slot Strip**:
A single-row, horizontally scrollable time-slot selection strip with snap alignment, edge fade indicators, keyboard navigation, and scroll chevrons, allowing patients to select an appointment window without vertical scrolling.
_Avoid_: Time grid, vertical slot list, slot picker dropdown

### Ordering & Accounting

**Order Confirmation**:
The administrative review step where the clinic reviews a placed order's delivery address and manually determines and applies delivery charges.
_Avoid_: Auto-dispatch, instant checkout

**Invoice Reference**:
A unique alphanumeric financial document identifier (e.g. `INV-2026-1042`) assigned to confirmed orders or services.
_Avoid_: Bill number, receipt tag

**Patient Ledger**:
The unified statement of account listing chronological debits (orders, Hijama visits, consultations) and credits (payments received via COD, bank, JazzCash, EasyPaisa, clinic cash) for a patient.
_Avoid_: Transaction log, history list

**Payment Record**:
An individual ledger entry capturing an actual financial transfer received from or refunded to a patient.
_Avoid_: Cash entry, bank slip

### Motion

**Step Transition**:
The animated change from one step to the next inside a multi-step flow, such as the Hijama booking wizard or the product form.
_Avoid_: Page transition, screen change, slide change

**Route Transition**:
The animated change caused by navigating from one URL to another.
_Avoid_: Page load, screen transition, navigation animation

**Surface Transition**:
The animated appearance, dismissal, or content swap of an overlay surface, such as a modal, drawer, or tab panel.
_Avoid_: Popup animation, tab effect

**Motion Token**:
A named duration or easing value shared by every transition in the app, so that motion stays consistent across surfaces.
_Avoid_: Animation constant, timing config, bezier variable

### Patient Authentication & Security

**Verification Code**:
A temporary, single-use 6-digit numeric passkey issued via email to confirm a patient's identity or verify email ownership.
_Avoid_: OTP, pin, activation link, token, secret

**Password Reset Code**:
A single-use 6-digit numeric passkey issued to a patient to authenticate an authorized password change request.
_Avoid_: Reset token, recovery link, reset password URL

### Administrative Access & Governance

**Super Admin**:
The sovereign administrative account holder possessing root system privileges, including exclusive authority to provision or revoke Admin accounts, access system security configuration, and decommission administrative roles.
_Avoid_: Root user, master admin, system owner

**Admin**:
An authorized operational staff member with access to daily clinical and e-commerce back-office capabilities (order management, catalog editing, consultations, Hijama bookings, customer inquiries), strictly restricted from managing staff or altering the Super Admin account.
_Avoid_: Manager, staff, operator, sub-admin

**Bootstrap Key**:
A cryptographically secure, single-use alphanumeric key generated on the server and redeemed exactly once on a dedicated setup interface to claim and initialize the permanent Super Admin account, permanently revoked and purged upon successful redemption.
_Avoid_: Master password, registration token, invite code, license key

**Admin Quota**:
The strict platform constraint enforcing a hard ceiling of at most three concurrent active Admin accounts across the system.
_Avoid_: Staff limit, user cap, seat count

**Super Admin Cell**:
The isolated, self-service security compartment within the Super Admin console where the Super Admin can review their credentials or self-terminate/transfer the role under mandatory password and authentication re-verification.
_Avoid_: Super admin profile, root panel, account killer
