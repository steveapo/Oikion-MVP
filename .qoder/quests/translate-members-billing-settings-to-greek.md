# Greek Translation Design: Members, Billing & Settings Pages

## Overview

This design defines the translation strategy for the Members, Billing, and Settings pages of the Oikion application from English to Greek. The approach follows the established pattern used for Properties, Relations, and Oikosync pages, ensuring consistency across the application's internationalization implementation.

**Scope:** Complete Greek localization of all user-facing text in the Members (team management), Billing (subscription management), and Settings (account/organization configuration) modules.

**Out of Scope:** 
- Email templates (handled separately)
- External Stripe UI (managed by Stripe)
- Database schema changes
- API response messages

---

## Translation File Structure

### English Translation Files (Baseline)

The following JSON translation files contain the source English strings:

| File | Purpose | Key Sections |
|------|---------|--------------|
| `messages/en/members.json` | Team management UI | header, roles, actions, empty states, invitations |
| `messages/en/billing.json` | Subscription management | header, plans, actions, messages, subscription details |
| `messages/en/admin.json` | Admin panel (settings context) | header, sections |
| `messages/en/common.json` | Shared UI elements | buttons, status labels, form labels, messages |
| `messages/en/navigation.json` | Menu items | sidebar, breadcrumbs |

### Greek Translation Files (Target)

Corresponding Greek files exist at `messages/el/` with the same structure. The design will define comprehensive Greek translations for all new content identified in Members, Billing, and Settings modules.

---

## Members Module Translation Design

### Translation Coverage

#### Page-Level Content

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Page Title | Members | Μέλη | Metadata, browser tab |
| Page Description | Manage your organization members and invitations | Διαχειριστείτε τα μέλη και τις προσκλήσεις του οργανισμού σας | Metadata |
| Header Title | Members | Μέλη | Main page heading |
| Subtitle Pattern | Manage your team members and invitations • {count} member(s) | Διαχειριστείτε τα μέλη της ομάδας και τις προσκλήσεις • {count} μέλη/μέλος | Dynamic count display |

#### Invitation Form Content

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Section Heading | Invite New Member | Πρόσκληση Νέου Μέλους | Form title |
| Card Title | Invite New Member | Πρόσκληση Νέου Μέλους | Form card header |
| Card Description | Send an invitation to join your organization | Στείλτε πρόσκληση για συμμετοχή στον οργανισμό σας | Explanatory text |
| Email Field Label | Email Address | Διεύθυνση Email | Form field |
| Email Placeholder | colleague@example.com | synergatis@example.com | Input placeholder |
| Email Help Text | They will receive an email invitation to join | Θα λάβουν μια πρόσκληση μέσω email για συμμετοχή | Field description |
| Role Field Label | Role | Ρόλος | Dropdown label |
| Role Placeholder | Select a role | Επιλέξτε ρόλο | Dropdown placeholder |
| Submit Button | Send Invitation | Αποστολή Πρόσκλησης | Primary action |

#### Role Definitions

Translation of role labels with descriptions:

| Role Code | Label (EN) | Label (EL) | Description (EN) | Description (EL) |
|-----------|------------|------------|------------------|------------------|
| ORG_OWNER | Owner | Ιδιοκτήτης | Full access to everything, including billing | Πλήρης πρόσβαση σε όλα, συμπεριλαμβανομένων των χρεώσεων |
| ADMIN | Admin | Διαχειριστής | Manage members and all organization content | Διαχείριση μελών και όλου του περιεχομένου του οργανισμού |
| AGENT | Agent | Πράκτορας | Create and edit properties and clients | Δημιουργία και επεξεργασία ακινήτων και πελατών |
| VIEWER | Viewer | Θεατής | Read-only access to organization data | Πρόσβαση μόνο για ανάγνωση στα δεδομένα του οργανισμού |

#### Team Members List

| Element | English | Greek | Usage |
|---------|---------|-------|-------|
| Section Heading | Team Members | Μέλη Ομάδας | List title |
| Table Header: Member | Member | Μέλος | Column heading |
| Table Header: Role | Role | Ρόλος | Column heading |
| Table Header: Joined | Joined | Εντάχθηκε | Column heading |
| No Name Fallback | No name | Χωρίς όνομα | When user has no display name |
| Current User Badge | (You) | (Εσείς) | Self-identification label |
| Actions Menu Label | Actions | Ενέργειες | Dropdown menu |
| Change Role Action | Change role | Αλλαγή ρόλου | Menu item |
| Remove Action | Remove from organization | Αφαίρεση από τον οργανισμό | Menu item |

#### Pending Invitations

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Section Heading | Pending Invitations ({count}) | Εκκρεμείς Προσκλήσεις ({count}) | Section title |
| Card Title | Pending Invitations | Εκκρεμείς Προσκλήσεις | Table container |
| Card Description | Invitations waiting to be accepted | Προσκλήσεις που αναμένουν αποδοχή | Explanatory text |
| Table Header: Email | Email | Email | Column |
| Table Header: Role | Role | Ρόλος | Column |
| Table Header: Invited By | Invited By | Προσκλήθηκε από | Column |
| Table Header: Expires | Expires | Λήγει | Column |
| Resend Action | Resend invitation | Επαναποστολή πρόσκλησης | Menu item |
| Cancel Action | Cancel invitation | Ακύρωση πρόσκλησης | Menu item |
| Expiry Time: Today | Expires today | Λήγει σήμερα | Time remaining indicator |
| Expiry Time: Tomorrow | Expires tomorrow | Λήγει αύριο | Time remaining indicator |
| Expiry Time: Days | Expires in {days} days | Λήγει σε {days} ημέρες | Time remaining pattern |

#### Update Role Dialog

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Dialog Title | Change Member Role | Αλλαγή Ρόλου Μέλους | Modal heading |
| Dialog Description | Update the role for {name} | Ενημέρωση ρόλου για {name} | Dynamic name insertion |
| Role Field Label | Role | Ρόλος | Dropdown label |
| Transfer Badge | (Transfer) | (Μεταβίβαση) | Shown for ORG_OWNER option |
| Save Button | Save Changes | Αποθήκευση Αλλαγών | Primary action |
| Cancel Button | Cancel | Ακύρωση | Secondary action (from common.json) |
| Self-Change Title | Change Your Role | Αλλαγή του Ρόλου Σας | When user tries to change own role |
| Self-Change Description | You cannot change your own role. | Δεν μπορείτε να αλλάξετε τον δικό σας ρόλο. | Restriction message |
| Owner Self-Change Help | As an owner, you can transfer ownership to another member if needed. | Ως ιδιοκτήτης, μπορείτε να μεταβιβάσετε την ιδιοκτησία σε άλλο μέλος εάν χρειάζεται. | Guidance text |
| Non-Owner Help | Contact an organization owner or administrator to change your role. | Επικοινωνήστε με έναν ιδιοκτήτη ή διαχειριστή οργανισμού για να αλλάξετε τον ρόλο σας. | Guidance text |
| Close Button | Close | Κλείσιμο | Dialog dismiss (from common.json) |

#### Transfer Ownership Confirmation

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Alert Title | Transfer Ownership | Μεταβίβαση Ιδιοκτησίας | Warning alert |
| Alert Description | You are about to transfer organization ownership to {name}. This action will demote you to ADMIN role. | Πρόκειται να μεταβιβάσετε την ιδιοκτησία του οργανισμού στο/στη {name}. Αυτή η ενέργεια θα σας υποβιβάσει σε ρόλο ΔΙΑΧΕΙΡΙΣΤΗ. | Critical action warning |
| Confirm Transfer Button | Confirm Transfer | Επιβεβαίωση Μεταβίβασης | Final confirmation |

#### Feedback Messages

| Message Key | English | Greek | Trigger |
|-------------|---------|-------|---------|
| Invitation Success | Invitation sent successfully | Η πρόσκληση στάλθηκε με επιτυχία | After successful invite |
| Invitation Error | Failed to send invitation | Αποτυχία αποστολής πρόσκλησης | On invite failure |
| Role Update Success | Member role updated | Ο ρόλος του μέλους ενημερώθηκε | After role change |
| Role Update Error | Failed to update role | Αποτυχία ενημέρωσης ρόλου | On role update failure |
| Ownership Transfer Success | Ownership transferred successfully | Η ιδιοκτησία μεταβιβάστηκε με επιτυχία | After ownership transfer |
| Ownership Transfer Error | Failed to transfer ownership | Αποτυχία μεταβίβασης ιδιοκτησίας | On transfer failure |
| Resend Success | Invitation resent | Η πρόσκληση επανεστάλη | After resend |
| Cancel Success | Invitation cancelled | Η πρόσκληση ακυρώθηκε | After cancellation |

#### Empty States

| State | English Title | Greek Title | English Description | Greek Description |
|-------|---------------|-------------|---------------------|-------------------|
| No Members | No members yet | Δεν υπάρχουν ακόμη μέλη | Invite team members to collaborate. | Προσκαλέστε μέλη της ομάδας για συνεργασία. |
| No Invitations | No pending invitations | Δεν υπάρχουν εκκρεμείς προσκλήσεις | All invitations have been accepted or expired. | Όλες οι προσκλήσεις έχουν γίνει αποδεκτές ή έχουν λήξει. |

---

## Billing Module Translation Design

### Translation Coverage

#### Page-Level Content

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Page Title | Billing – SaaS Starter | Χρεώσεις – SaaS Starter | Metadata |
| Page Description | Manage billing and your subscription plan. | Διαχειριστείτε τη χρέωση και το πλάνο συνδρομής σας. | Metadata |
| Header Title | Billing | Χρεώσεις | Main heading |
| Header Text | Manage billing and your subscription plan. | Διαχειριστείτε τη χρέωση και το πλάνο συνδρομής σας. | Subheading |

#### Test Mode Alert

| Element | English | Greek | Purpose |
|---------|---------|-------|---------|
| Alert Title | This is a demo app. | Αυτή είναι μια εφαρμογή επίδειξης. | Warning title |
| Alert Description | SaaS Starter app is a demo app using a Stripe test environment. You can find a list of test card numbers on the [Stripe docs](link). | Η εφαρμογή SaaS Starter είναι μια εφαρμογή επίδειξης που χρησιμοποιεί περιβάλλον δοκιμής Stripe. Μπορείτε να βρείτε λίστα με αριθμούς καρτών δοκιμής στα [έγγραφα Stripe](link). | Test environment notice |
| Stripe Docs Link Text | Stripe docs | έγγραφα Stripe | Hyperlink text |

#### Subscription Plan Card

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Card Title | Subscription Plan | Πλάνο Συνδρομής | Card header |
| Card Description | You are currently on the **{plan}** plan. | Αυτή τη στιγμή βρίσκεστε στο πλάνο **{plan}**. | Plan status (plan name inserted dynamically) |
| Card Content | {description} | {περιγραφή} | Plan description from subscription config |
| Renews Text (Active) | Your plan renews on {date}. | Το πλάνο σας ανανεώνεται στις {date}. | Active subscription footer |
| Cancels Text (Canceled) | Your plan will be canceled on {date}. | Το πλάνο σας θα ακυρωθεί στις {date}. | Canceled subscription footer |

#### Plan Names

| Plan Code | English | Greek |
|-----------|---------|-------|
| Free | Free | Δωρεάν |
| Starter | Starter | Εκκίνηση |
| Professional | Professional | Επαγγελματικό |
| Enterprise | Enterprise | Επιχειρηματικό |
| Pro | Pro | Pro |
| Business | Business | Επιχειρηματικό |

#### Billing Actions

| Action | English | Greek | Context |
|--------|---------|-------|---------|
| Open Customer Portal | Open Customer Portal | Άνοιγμα Πύλης Πελάτη | Button for paid subscribers to manage via Stripe |
| Choose a plan | Choose a plan | Επιλέξτε ένα πλάνο | Button for free users to upgrade |
| Manage Subscription | Manage Subscription | Διαχείριση Συνδρομής | Alternative action button |
| Upgrade | Upgrade | Αναβάθμιση | CTA for upgrade |
| Loading... | Loading... | Φόρτωση... | Button loading state (from common.json) |

#### Billing Messages

| Message Key | English | Greek | Usage |
|-------------|---------|-------|-------|
| Test Mode | Test mode enabled - no real charges will be made | Λειτουργία δοκιμής ενεργοποιημένη - δεν θα πραγματοποιηθούν πραγματικές χρεώσεις | System notice |
| Active Subscription | Your subscription is active | Η συνδρομή σας είναι ενεργή | Status indicator |
| Expired Subscription | Your subscription has expired | Η συνδρομή σας έχει λήξει | Status indicator |
| Canceled Subscription | Your subscription has been canceled | Η συνδρομή σας έχει ακυρωθεί | Status indicator |

#### Subscription Status Badges

| Status | English | Greek | Variant |
|--------|---------|-------|---------|
| Active | Active | Ενεργή | Success/green |
| Canceled | Canceled | Ακυρώθηκε | Warning/amber |
| Expired | Expired | Έληξε | Destructive/red |
| Trial | Trial | Δοκιμαστική Περίοδος | Secondary |

---

## Settings Module Translation Design

### Translation Coverage

#### Page-Level Content

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Page Title | Settings – SaaS Starter | Ρυθμίσεις – SaaS Starter | Metadata |
| Page Description | Manage your account and organization settings. | Διαχειριστείτε τις ρυθμίσεις του λογαριασμού και του οργανισμού σας. | Metadata |
| Header Title | Settings | Ρυθμίσεις | Main heading |
| Header Text | Manage your account and organization settings. | Διαχειριστείτε τις ρυθμίσεις του λογαριασμού και του οργανισμού σας. | Subheading |

#### Organization Settings Form

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Card Title | Organization Settings | Ρυθμίσεις Οργανισμού | Form card header |
| Card Description | Update your organization information | Ενημερώστε τις πληροφορίες του οργανισμού σας | Form description |
| Organization Name Label | Organization Name | Όνομα Οργανισμού | Field label |
| Organization Name Help | The name of your organization | Το όνομα του οργανισμού σας | Field description |
| Plan Label | Subscription Plan | Πλάνο Συνδρομής | Dropdown label |
| Plan Help | Your current subscription tier | Το τρέχον επίπεδο συνδρομής σας | Field description |
| Save Button | Save Changes | Αποθήκευση Αλλαγών | Primary action (from common.json) |
| Cancel Button | Cancel | Ακύρωση | Secondary action (from common.json) |

#### User Name Form

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Section Title | Your Name | Το Όνομά Σας | Section heading |
| Section Description | Please enter a display name you are comfortable with. | Παρακαλώ εισάγετε ένα εμφανιζόμενο όνομα με το οποίο αισθάνεστε άνετα. | Explanatory text |
| Name Field Label | Name | Όνομα | Input label (from common.json) |
| Save Button | Save | Αποθήκευση | Compact save button (from common.json) |
| Save Changes Button | Save Changes | Αποθήκευση Αλλαγών | Full-width button variant |
| Character Limit Help | Max 32 characters | Μέγιστο 32 χαρακτήρες | Field constraint |
| Success Toast | Your name has been updated. | Το όνομά σας έχει ενημερωθεί. | Feedback message |
| Error Toast Title | Something went wrong. | Κάτι πήγε στραβά. | Error title |
| Error Toast Description | Your name was not updated. Please try again. | Το όνομά σας δεν ενημερώθηκε. Παρακαλώ δοκιμάστε ξανά. | Error detail |

#### Delete Organization Section

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Section Title | Delete Organization | Διαγραφή Οργανισμού | Section heading |
| Section Description | Permanently delete your organization and all related data (properties, clients, tasks, interactions, activities). This action cannot be undone. | Μόνιμη διαγραφή του οργανισμού σας και όλων των σχετικών δεδομένων (ακίνητα, πελάτες, εργασίες, αλληλεπιδράσεις, δραστηριότητες). Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. | Warning text |
| Delete Button Label | Delete Agency | Διαγραφή Οργανισμού | Button text |
| Modal Title | Delete Organization | Διαγραφή Οργανισμού | Confirmation modal heading |
| Modal Warning | **Warning:** This will permanently delete your organization and all related data (properties, clients, tasks, interactions, activities). This action cannot be undone. | **Προειδοποίηση:** Αυτό θα διαγράψει οριστικά τον οργανισμό σας και όλα τα σχετικά δεδομένα (ακίνητα, πελάτες, εργασίες, αλληλεπιδράσεις, δραστηριότητες). Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. | Modal body |
| Verification Label | To verify, type **confirm delete organization** below | Για επιβεβαίωση, πληκτρολογήστε **confirm delete organization** παρακάτω | Input instruction |
| Verification Phrase | confirm delete organization | confirm delete organization | Exact match required (DO NOT TRANSLATE) |
| Confirm Button | Confirm delete organization | Επιβεβαίωση διαγραφής οργανισμού | Final action button |
| Loading Message | Deleting organization... | Διαγραφή οργανισμού... | Toast loading state |
| Success Message | Organization deleted | Ο οργανισμός διαγράφηκε | Toast success |
| Error Message | Failed to delete organization | Αποτυχία διαγραφής οργανισμού | Toast error |

#### Personal Organization Protection

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Dialog Title | Personal Agency | Προσωπικός Οργανισμός | Information modal |
| Dialog Description | This is your personal agency, if you are a Solo Agent it's for you. | Αυτός είναι ο προσωπικός σας οργανισμός, εάν είστε Μεμονωμένος Πράκτορας είναι για εσάς. | Explanation |
| Info Text | Your personal agency is automatically created when you sign up and cannot be deleted. It's your private workspace for managing your own properties and clients. | Ο προσωπικός σας οργανισμός δημιουργείται αυτόματα όταν εγγράφεστε και δεν μπορεί να διαγραφεί. Είναι ο ιδιωτικός σας χώρος εργασίας για τη διαχείριση των δικών σας ακινήτων και πελατών. | Detailed explanation |
| Understand Button | Okay, I understand | Εντάξει, κατάλαβα | Acknowledgment |
| Overlay Message | This is your personal agency | Αυτός είναι ο προσωπικός σας οργανισμός | Blocked section overlay |
| Overlay Help | Click to learn more | Κάντε κλικ για να μάθετε περισσότερα | Interactive hint |

#### Delete Account Section

| Element | English | Greek | Notes |
|---------|---------|-------|-------|
| Section Title | Delete Account | Διαγραφή Λογαριασμού | Section heading |
| Section Description (No Sub) | Permanently delete your {appName} account. This action cannot be undone - please proceed with caution. | Μόνιμη διαγραφή του λογαριασμού σας στο {appName}. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί - παρακαλώ προχωρήστε με προσοχή. | Warning without subscription |
| Section Description (With Sub) | Permanently delete your {appName} account and your subscription. This action cannot be undone - please proceed with caution. | Μόνιμη διαγραφή του λογαριασμού σας στο {appName} και της συνδρομής σας. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί - παρακαλώ προχωρήστε με προσοχή. | Warning with active subscription |
| Subscription Badge | Active Subscription | Ενεργή Συνδρομή | Status indicator |
| Delete Button Label | Delete Account | Διαγραφή Λογαριασμού | Button text |
| Modal Title | Delete Account | Διαγραφή Λογαριασμού | Confirmation modal |
| Modal Warning | Deleting your account will delete your organization, all your content (properties, clients, tasks, interactions, activities) and remove all members. This action cannot be undone. | Η διαγραφή του λογαριασμού σας θα διαγράψει τον οργανισμό σας, όλο το περιεχόμενό σας (ακίνητα, πελάτες, εργασίες, αλληλεπιδράσεις, δραστηριότητες) και θα αφαιρέσει όλα τα μέλη. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. | Critical warning |
| Verification Label | To verify, type **confirm delete account** below | Για επιβεβαίωση, πληκτρολογήστε **confirm delete account** παρακάτω | Input instruction |
| Verification Phrase | confirm delete account | confirm delete account | Exact match required (DO NOT TRANSLATE) |
| Confirm Button | Confirm delete account | Επιβεβαίωση διαγραφής λογαριασμού | Final action button |
| Loading Toast | Deleting account... | Διαγραφή λογαριασμού... | Progress indicator |
| Success Toast | Account deleted successfully! | Ο λογαριασμός διαγράφηκε με επιτυχία! | Completion message |
| Error Toast | Failed to delete account | Αποτυχία διαγραφής λογαριασμού | Error message |

#### Language Preference (if implemented)

| Element | English | Greek | Context |
|---------|---------|-------|---------|
| Section Title | Language Preference | Προτίμηση Γλώσσας | Settings section |
| Section Description | Choose your preferred language for the interface | Επιλέξτε την προτιμώμενη γλώσσα για τη διεπαφή | Explanation |
| Language Field Label | Language | Γλώσσα | Dropdown label |
| English Option | English | Αγγλικά | Language choice |
| Greek Option | Greek (Ελληνικά) | Ελληνικά (Greek) | Language choice |

---

## Translation File Schema Design

### Extended members.json Structure

```
members.json
├── header
│   ├── title: "Members" / "Μέλη"
│   ├── description: "Manage..." / "Διαχειριστείτε..."
│   └── subtitle: "Manage your team..." / "Διαχειριστείτε την ομάδα..."
├── roles
│   ├── ORG_OWNER
│   │   ├── label: "Owner" / "Ιδιοκτήτης"
│   │   └── description: "Full access..." / "Πλήρης πρόσβαση..."
│   ├── ADMIN (similar structure)
│   ├── AGENT (similar structure)
│   └── VIEWER (similar structure)
├── actions
│   ├── invite: "Invite Member" / "Πρόσκληση Μέλους"
│   ├── remove: "Remove Member" / "Αφαίρεση Μέλους"
│   ├── changeRole: "Change Role" / "Αλλαγή Ρόλου"
│   ├── sendInvitation: "Send Invitation" / "Αποστολή Πρόσκλησης"
│   ├── resendInvitation: "Resend invitation" / "Επαναποστολή πρόσκλησης"
│   └── cancelInvitation: "Cancel invitation" / "Ακύρωση πρόσκλησης"
├── inviteForm
│   ├── title: "Invite New Member" / "Πρόσκληση Νέου Μέλους"
│   ├── description: "Send an invitation..." / "Στείλτε πρόσκληση..."
│   ├── emailLabel: "Email Address" / "Διεύθυνση Email"
│   ├── emailPlaceholder: "colleague@..." / "synergatis@..."
│   ├── emailHelp: "They will receive..." / "Θα λάβουν..."
│   ├── roleLabel: "Role" / "Ρόλος"
│   └── rolePlaceholder: "Select a role" / "Επιλέξτε ρόλο"
├── membersList
│   ├── title: "Team Members" / "Μέλη Ομάδας"
│   ├── description: "{count} member(s)..." / "{count} μέλη/μέλος..."
│   ├── tableHeaders
│   │   ├── member: "Member" / "Μέλος"
│   │   ├── role: "Role" / "Ρόλος"
│   │   └── joined: "Joined" / "Εντάχθηκε"
│   ├── noName: "No name" / "Χωρίς όνομα"
│   ├── currentUser: "(You)" / "(Εσείς)"
│   ├── actionsMenu: "Actions" / "Ενέργειες"
│   ├── changeRoleAction: "Change role" / "Αλλαγή ρόλου"
│   └── removeAction: "Remove from organization" / "Αφαίρεση από τον οργανισμό"
├── pendingInvitations
│   ├── title: "Pending Invitations" / "Εκκρεμείς Προσκλήσεις"
│   ├── titleWithCount: "Pending Invitations ({count})" / "Εκκρεμείς Προσκλήσεις ({count})"
│   ├── description: "Invitations waiting..." / "Προσκλήσεις που αναμένουν..."
│   ├── tableHeaders
│   │   ├── email: "Email" / "Email"
│   │   ├── role: "Role" / "Ρόλος"
│   │   ├── invitedBy: "Invited By" / "Προσκλήθηκε από"
│   │   └── expires: "Expires" / "Λήγει"
│   └── expiry
│       ├── today: "Expires today" / "Λήγει σήμερα"
│       ├── tomorrow: "Expires tomorrow" / "Λήγει αύριο"
│       └── days: "Expires in {days} days" / "Λήγει σε {days} ημέρες"
├── updateRoleDialog
│   ├── title: "Change Member Role" / "Αλλαγή Ρόλου Μέλους"
│   ├── description: "Update the role for {name}" / "Ενημέρωση ρόλου για {name}"
│   ├── roleLabel: "Role" / "Ρόλος"
│   ├── rolePlaceholder: "Select a role" / "Επιλέξτε ρόλο"
│   ├── transferBadge: "(Transfer)" / "(Μεταβίβαση)"
│   ├── saveButton: "Save Changes" / "Αποθήκευση Αλλαγών"
│   ├── selfChangeTitle: "Change Your Role" / "Αλλαγή του Ρόλου Σας"
│   ├── selfChangeDescription: "You cannot..." / "Δεν μπορείτε..."
│   ├── ownerSelfHelp: "As an owner..." / "Ως ιδιοκτήτης..."
│   └── nonOwnerHelp: "Contact an organization..." / "Επικοινωνήστε..."
├── transferOwnership
│   ├── alertTitle: "Transfer Ownership" / "Μεταβίβαση Ιδιοκτησίας"
│   ├── alertDescription: "You are about to..." / "Πρόκειται να..."
│   └── confirmButton: "Confirm Transfer" / "Επιβεβαίωση Μεταβίβασης"
├── messages
│   ├── invitationSent: "Invitation sent..." / "Η πρόσκληση στάλθηκε..."
│   ├── invitationError: "Failed to send..." / "Αποτυχία αποστολής..."
│   ├── roleUpdated: "Member role updated" / "Ο ρόλος... ενημερώθηκε"
│   ├── roleUpdateError: "Failed to update..." / "Αποτυχία ενημέρωσης..."
│   ├── ownershipTransferred: "Ownership transferred..." / "Η ιδιοκτησία μεταβιβάστηκε..."
│   ├── ownershipTransferError: "Failed to transfer..." / "Αποτυχία μεταβίβασης..."
│   ├── invitationResent: "Invitation resent" / "Η πρόσκληση επανεστάλη"
│   └── invitationCanceled: "Invitation cancelled" / "Η πρόσκληση ακυρώθηκε"
└── empty
    ├── noMembers
    │   ├── title: "No members yet" / "Δεν υπάρχουν ακόμη μέλη"
    │   └── description: "Invite team members..." / "Προσκαλέστε μέλη..."
    └── noInvitations
        ├── title: "No pending invitations" / "Δεν υπάρχουν εκκρεμείς προσκλήσεις"
        └── description: "All invitations have..." / "Όλες οι προσκλήσεις έχουν..."
```

### Extended billing.json Structure

```
billing.json
├── header
│   ├── title: "Billing" / "Χρεώσεις"
│   └── description: "Manage billing..." / "Διαχειριστείτε τη χρέωση..."
├── plans
│   ├── free: "Free" / "Δωρεάν"
│   ├── starter: "Starter" / "Εκκίνηση"
│   ├── pro: "Pro" / "Pro"
│   ├── professional: "Professional" / "Επαγγελματικό"
│   ├── business: "Business" / "Επιχειρηματικό"
│   └── enterprise: "Enterprise" / "Επιχειρηματικό"
├── actions
│   ├── subscribe: "Subscribe" / "Εγγραφή"
│   ├── manageSubscription: "Manage Subscription" / "Διαχείριση Συνδρομής"
│   ├── cancelSubscription: "Cancel Subscription" / "Ακύρωση Συνδρομής"
│   ├── openCustomerPortal: "Open Customer Portal" / "Άνοιγμα Πύλης Πελάτη"
│   ├── choosePlan: "Choose a plan" / "Επιλέξτε ένα πλάνο"
│   └── upgrade: "Upgrade" / "Αναβάθμιση"
├── subscriptionCard
│   ├── title: "Subscription Plan" / "Πλάνο Συνδρομής"
│   ├── currentPlan: "You are currently on the **{plan}** plan." / "Αυτή τη στιγμή... **{plan}**..."
│   ├── renews: "Your plan renews on {date}." / "Το πλάνο σας ανανεώνεται... {date}."
│   └── cancels: "Your plan will be canceled on {date}." / "Το πλάνο σας θα ακυρωθεί... {date}."
├── testModeAlert
│   ├── title: "This is a demo app." / "Αυτή είναι μια εφαρμογή επίδειξης."
│   ├── description: "SaaS Starter app is..." / "Η εφαρμογή SaaS Starter..."
│   └── docsLinkText: "Stripe docs" / "έγγραφα Stripe"
├── messages
│   ├── testMode: "Test mode enabled..." / "Λειτουργία δοκιμής..."
│   ├── active: "Your subscription is active" / "Η συνδρομή σας είναι ενεργή"
│   ├── expired: "Your subscription has expired" / "Η συνδρομή σας έχει λήξει"
│   └── canceled: "Your subscription has been canceled" / "Η συνδρομή σας έχει ακυρωθεί"
└── status
    ├── active: "Active" / "Ενεργή"
    ├── canceled: "Canceled" / "Ακυρώθηκε"
    ├── expired: "Expired" / "Έληξε"
    └── trial: "Trial" / "Δοκιμαστική Περίοδος"
```

### New settings.json Structure

```
settings.json
├── header
│   ├── title: "Settings" / "Ρυθμίσεις"
│   └── description: "Manage your account..." / "Διαχειριστείτε τις ρυθμίσεις..."
├── organizationSettings
│   ├── title: "Organization Settings" / "Ρυθμίσεις Οργανισμού"
│   ├── description: "Update your organization..." / "Ενημερώστε τις πληροφορίες..."
│   ├── nameLabel: "Organization Name" / "Όνομα Οργανισμού"
│   ├── nameHelp: "The name of your organization" / "Το όνομα του οργανισμού σας"
│   ├── planLabel: "Subscription Plan" / "Πλάνο Συνδρομής"
│   └── planHelp: "Your current subscription tier" / "Το τρέχον επίπεδο συνδρομής σας"
├── userNameSettings
│   ├── title: "Your Name" / "Το Όνομά Σας"
│   ├── description: "Please enter a display name..." / "Παρακαλώ εισάγετε..."
│   ├── characterLimit: "Max 32 characters" / "Μέγιστο 32 χαρακτήρες"
│   ├── updateSuccess: "Your name has been updated." / "Το όνομά σας... ενημερώθηκε."
│   ├── updateErrorTitle: "Something went wrong." / "Κάτι πήγε στραβά."
│   └── updateErrorDescription: "Your name was not updated..." / "Το όνομά σας δεν..."
├── deleteOrganization
│   ├── title: "Delete Organization" / "Διαγραφή Οργανισμού"
│   ├── description: "Permanently delete your organization..." / "Μόνιμη διαγραφή..."
│   ├── buttonLabel: "Delete Agency" / "Διαγραφή Οργανισμού"
│   ├── modalTitle: "Delete Organization" / "Διαγραφή Οργανισμού"
│   ├── modalWarning: "**Warning:** This will..." / "**Προειδοποίηση:** Αυτό..."
│   ├── verificationLabel: "To verify, type..." / "Για επιβεβαίωση..."
│   ├── verificationPhrase: "confirm delete organization" (DO NOT TRANSLATE)
│   ├── confirmButton: "Confirm delete organization" / "Επιβεβαίωση διαγραφής..."
│   ├── loadingMessage: "Deleting organization..." / "Διαγραφή οργανισμού..."
│   ├── successMessage: "Organization deleted" / "Ο οργανισμός διαγράφηκε"
│   └── errorMessage: "Failed to delete organization" / "Αποτυχία διαγραφής..."
├── personalOrganization
│   ├── dialogTitle: "Personal Agency" / "Προσωπικός Οργανισμός"
│   ├── dialogDescription: "This is your personal agency..." / "Αυτός είναι ο προσωπικός..."
│   ├── infoText: "Your personal agency is..." / "Ο προσωπικός σας οργανισμός..."
│   ├── understandButton: "Okay, I understand" / "Εντάξει, κατάλαβα"
│   ├── overlayMessage: "This is your personal agency" / "Αυτός είναι ο προσωπικός..."
│   └── overlayHelp: "Click to learn more" / "Κάντε κλικ για να μάθετε..."
├── deleteAccount
│   ├── title: "Delete Account" / "Διαγραφή Λογαριασμού"
│   ├── description: "Permanently delete your..." / "Μόνιμη διαγραφή..."
│   ├── descriptionWithSub: "...and your subscription..." / "...και της συνδρομής σας..."
│   ├── subscriptionBadge: "Active Subscription" / "Ενεργή Συνδρομή"
│   ├── buttonLabel: "Delete Account" / "Διαγραφή Λογαριασμού"
│   ├── modalTitle: "Delete Account" / "Διαγραφή Λογαριασμού"
│   ├── modalWarning: "Deleting your account will..." / "Η διαγραφή του λογαριασμού..."
│   ├── verificationLabel: "To verify, type..." / "Για επιβεβαίωση..."
│   ├── verificationPhrase: "confirm delete account" (DO NOT TRANSLATE)
│   ├── confirmButton: "Confirm delete account" / "Επιβεβαίωση διαγραφής λογαριασμού"
│   ├── loadingToast: "Deleting account..." / "Διαγραφή λογαριασμού..."
│   ├── successToast: "Account deleted successfully!" / "Ο λογαριασμός διαγράφηκε..."
│   └── errorToast: "Failed to delete account" / "Αποτυχία διαγραφής..."
└── languagePreference (optional)
    ├── title: "Language Preference" / "Προτίμηση Γλώσσας"
    ├── description: "Choose your preferred language..." / "Επιλέξτε..."
    ├── label: "Language" / "Γλώσσα"
    ├── english: "English" / "Αγγλικά"
    └── greek: "Greek (Ελληνικά)" / "Ελληνικά (Greek)"
```

---

## Component Translation Integration Strategy

### Translation Key Naming Conventions

Follow the established pattern:

**Pattern:**
`{module}.{section}.{element}`

**Examples:**
- `members.header.title` → "Members" / "Μέλη"
- `members.inviteForm.emailLabel` → "Email Address" / "Διεύθυνση Email"
- `billing.actions.openCustomerPortal` → "Open Customer Portal" / "Άνοιγμα Πύλης Πελάτη"
- `settings.deleteAccount.modalWarning` → Deletion warning text

### Component Refactoring Approach

Components that currently contain hardcoded English strings must be refactored to use the `useTranslations` hook from `next-intl`.

#### Example Pattern (Members Page)

**Before (Hardcoded):**
```typescript
<h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
```

**After (Translated):**
```typescript
const t = useTranslations('members.inviteForm');
<h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
```

### Dynamic Content Translation

For messages with variable interpolation:

**Translation Definition:**
```json
{
  "members": {
    "updateRoleDialog": {
      "description": "Update the role for {name}"
    }
  }
}
```

**Component Usage:**
```typescript
const t = useTranslations('members.updateRoleDialog');
<DialogDescription>
  {t('description', { name: member.name || member.email })}
</DialogDescription>
```

### Pluralization Handling

For count-dependent text (e.g., "1 member" vs "2 members"):

**Translation Definition:**
```json
{
  "members": {
    "membersList": {
      "count_one": "{count} member in your organization",
      "count_other": "{count} members in your organization"
    }
  }
}
```

**Component Usage:**
```typescript
const t = useTranslations('members.membersList');
<CardDescription>
  {t('count', { count: members.length })}
</CardDescription>
```

---

## Verification & Quality Assurance

### Translation Completeness Check

All components must be verified to ensure:

1. **No hardcoded English strings** remain in UI-visible elements
2. **All toast/notification messages** use translation keys
3. **Form validation messages** reference `validation.json` or localized schemas
4. **Dynamic content** (dates, numbers, currency) uses appropriate formatters

### Visual Context Review

Translation strings should be reviewed in their actual UI context to ensure:

- **Length appropriateness** (Greek text is typically 10-30% longer than English)
- **Grammatical correctness** in UI labels (e.g., imperative vs. descriptive tone)
- **Cultural appropriateness** (especially for action buttons and warnings)
- **Consistency** with existing translations in Properties/Relations/Oikosync

### Functional Testing Scenarios

#### Members Module
1. View members list in both languages
2. Send an invitation (verify all form labels, placeholders, and toast messages)
3. Change a member's role (verify dialog content and confirmation messages)
4. Attempt to change own role (verify restriction messages)
5. Transfer ownership (verify warning alert and confirmation flow)
6. View pending invitations with various expiry states
7. Resend and cancel invitations (verify action confirmations)

#### Billing Module
1. View billing page as free user (verify "Choose a plan" CTA)
2. View billing page as paid user (verify "Open Customer Portal" button)
3. View test mode alert (verify all text and link)
4. View subscription renewal date formatting
5. View cancelled subscription messaging

#### Settings Module
1. Update organization name and plan (verify form labels and success messages)
2. Update user display name (verify validation and feedback)
3. Attempt to delete personal organization (verify protection dialog)
4. Attempt to delete non-personal organization (verify confirmation flow)
5. View delete account warning (with and without active subscription)
6. Verify all character limit and validation messages

---

## Translation Reference Tables

### Common Action Buttons (Reused Across Modules)

| English | Greek | Source File | Usage Context |
|---------|-------|-------------|---------------|
| Save | Αποθήκευση | common.json | Form submissions |
| Save Changes | Αποθήκευση Αλλαγών | common.json | Update forms |
| Cancel | Ακύρωση | common.json | Cancel actions |
| Delete | Διαγραφή | common.json | Destructive actions |
| Edit | Επεξεργασία | common.json | Edit triggers |
| Create | Δημιουργία | common.json | Create actions |
| Update | Ενημέρωση | common.json | Update actions |
| Submit | Υποβολή | common.json | Form submission |
| Close | Κλείσιμο | common.json | Dialog dismiss |
| Confirm | Επιβεβαίωση | common.json | Confirmations |
| Back | Πίσω | common.json | Navigation |
| Next | Επόμενο | common.json | Navigation |
| Loading... | Φόρτωση... | common.json | Loading states |

### Status Indicators (Shared)

| English | Greek | Visual Treatment |
|---------|-------|------------------|
| Active | Ενεργή | Green badge |
| Pending | Εκκρεμεί | Yellow/amber badge |
| Expired | Έληξε | Red badge |
| Canceled | Ακυρώθηκε | Gray badge |
| Completed | Ολοκληρώθηκε | Green badge |
| Success! | Επιτυχία! | Toast notification |
| Error | Σφάλμα | Toast notification |

### Form Field Labels (Common)

| English | Greek | Field Type |
|---------|-------|------------|
| Name | Όνομα | Text input |
| Email | Email | Email input |
| Phone | Τηλέφωνο | Tel input |
| Description | Περιγραφή | Textarea |
| Notes | Σημειώσεις | Textarea |
| Date | Ημερομηνία | Date picker |
| Time | Ώρα | Time picker |
| Actions | Ενέργειες | Table column / menu |
| Search | Αναζήτηση | Search input |
| Filter | Φίλτρο | Filter controls |
| Sort | Ταξινόμηση | Sort controls |

---

## Implementation Workflow

### Phase 1: Translation File Creation
1. Extend `messages/en/members.json` with complete English strings
2. Extend `messages/en/billing.json` with additional English strings
3. Create `messages/en/settings.json` with all settings-related strings
4. Mirror structure in Greek files (`messages/el/`)
5. Validate JSON syntax and key consistency

### Phase 2: Component Refactoring
**Members Components:**
- `/app/(protected)/dashboard/members/page.tsx`
- `/components/members/invite-member-form.tsx`
- `/components/members/members-list.tsx`
- `/components/members/pending-invitations.tsx`
- `/components/members/update-member-role-dialog.tsx`
- `/components/members/remove-member-dialog.tsx`

**Billing Components:**
- `/app/(protected)/dashboard/billing/page.tsx`
- `/components/pricing/billing-info.tsx`
- `/components/forms/customer-portal-button.tsx`
- `/components/forms/billing-form-button.tsx`

**Settings Components:**
- `/app/(protected)/dashboard/settings/page.tsx`
- `/components/forms/organization-settings-form.tsx`
- `/components/forms/user-name-form.tsx`
- `/components/dashboard/delete-organization.tsx`
- `/components/dashboard/delete-account.tsx`
- `/components/modals/delete-organization-modal.tsx`
- `/components/modals/delete-account-modal.tsx`

### Phase 3: Server Action Messages
Ensure server actions return translatable message keys (not hardcoded strings):
- `/actions/members.ts` → Return error/success keys
- `/actions/invitations.ts` → Return message keys
- `/actions/organizations.ts` → Return message keys
- `/actions/update-user-name.ts` → Return message keys

### Phase 4: Metadata Localization
Update page metadata to use translated strings:
- Members page `metadata.title` and `metadata.description`
- Billing page metadata
- Settings page metadata

### Phase 5: Navigation Integration
Verify navigation items use translation keys:
- Sidebar menu: Members, Billing, Settings
- Breadcrumbs (if applicable)
- Mobile navigation

---

## Edge Cases & Special Considerations

### 1. Verification Phrases (DO NOT TRANSLATE)

The exact-match verification phrases for destructive actions **must remain in English** to prevent accidental deletions:

- `confirm delete organization` (unchanged in all locales)
- `confirm delete account` (unchanged in all locales)

**Rationale:** These are security safeguards; users must consciously type the English phrase to confirm understanding of the irreversible action.

### 2. Role Code Constants

Role enum values (`ORG_OWNER`, `ADMIN`, `AGENT`, `VIEWER`) remain unchanged in code. Only their **display labels** are translated.

### 3. Date and Time Formatting

Dates must use locale-aware formatting:
- English: "March 15, 2024"
- Greek: "15 Μαρτίου 2024"

Use `Intl.DateTimeFormat` with appropriate locale:
```typescript
const formattedDate = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(date);
```

### 4. Brand Name Preservation

Per established translation rules:
- **"Oikosync"** remains untranslated
- **"Oikion"** remains untranslated
- **"SaaS Starter"** remains untranslated (legacy template name)

### 5. External Service References

- **"Stripe"** → Remains "Stripe" (brand name)
- **"Stripe docs"** → "έγγραφα Stripe" (descriptive translation)
- **"Customer Portal"** → "Πύλη Πελάτη" (functional translation)

### 6. Pluralization Rules

Greek pluralization differs from English. Use `next-intl` plural rules:

**English:**
- 1 member
- 2 members

**Greek:**
- 1 μέλος (singular)
- 2 μέλη (plural)

**Implementation:**
```json
{
  "count_one": "{count} μέλος",
  "count_other": "{count} μέλη"
}
```

### 7. Gender-Neutral Language

Greek has grammatical gender. Where possible, use gender-neutral or inclusive forms:
- Avoid gendered pronouns when referring to generic users
- Use role titles that work for all genders
- Example: "Μέλος" (member) is neutral

### 8. Tone Consistency

Maintain consistent tone across modules:
- **Formal/Professional** tone for settings and billing
- **Collaborative** tone for team management
- **Clear and Direct** for warning messages
- **Encouraging** for empty states and CTAs

---

## Success Criteria

Translation is complete when:

1. ✅ All English strings in Members, Billing, and Settings pages are extracted into JSON files
2. ✅ Corresponding Greek translations exist with identical key structure
3. ✅ All components use `useTranslations` hook (no hardcoded strings)
4. ✅ Toast notifications display in the user's selected language
5. ✅ Form validation messages are localized
6. ✅ Page metadata (title, description) reflects current locale
7. ✅ Date/time formatting adapts to locale
8. ✅ Empty states, error states, and loading states are translated
9. ✅ Modal dialogs (delete confirmations, role changes) display correctly in both languages
10. ✅ Navigation items (sidebar, breadcrumbs) use translation keys
11. ✅ No console warnings or errors related to missing translation keys
12. ✅ Visual regression testing passes (layout remains correct with longer Greek text)
13. ✅ Functional testing scenarios pass in both English and Greek
14. ✅ Translation files pass JSON validation
15. ✅ Code review confirms consistent translation key naming patterns
