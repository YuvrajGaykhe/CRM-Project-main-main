# Feature Specification: Sigma Audio Dealer & Sales Intelligence Platform

**Feature Branch**: `001-sigma-audio-platform`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "Build the Sigma Audio Dealer & Sales Intelligence Platform"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Lead Operations (Priority: P1)

A sales executive manages only assigned leads end-to-end from intake through conversion/loss,
including follow-ups, notes, status changes, and assignment-driven timeline history.

**Why this priority**: Lead flow is the highest-value operational path and replaces spreadsheet tracking.

**Independent Test**: With a sales-executive account, create/import leads, progress one lead through
pipeline states, add follow-ups and notes, and verify only owned leads are visible.

**Acceptance Scenarios**:

1. **Given** a lead assigned to an executive, **When** the executive opens the lead list,
   **Then** only assigned leads are shown.
2. **Given** a lead in `new`, **When** status changes to `contacted`, **Then** timeline and audit entries are recorded.
3. **Given** follow-ups exist, **When** one is completed or missed, **Then** lead history shows the event in sequence.

---

### User Story 2 - Dealer Lifecycle and Territory Control (Priority: P2)

A dealer manager onboards and manages dealers through approval states and territory ownership,
while seeing live dealer impact metrics derived from linked lead activity.

**Why this priority**: Dealer network quality and activation directly impacts conversions and revenue.

**Independent Test**: Create dealer records, move approval states, assign territory managers, and verify
live lead/revenue views update from linked lead changes.

**Acceptance Scenarios**:

1. **Given** a new dealer profile, **When** dealer status moves to `active`,
   **Then** dealer manager and affected users receive expected state updates.
2. **Given** leads are reassigned to a dealer, **When** the dealer list refreshes,
   **Then** active lead count reflects current data without manual recalculation.

---

### User Story 3 - Role-Based Leadership Visibility (Priority: P3)

Admins and sales managers view organization-wide analytics and immutable audit logs, while
restricted roles are blocked from privileged endpoints.

**Why this priority**: Leadership decisions depend on trusted data and strict RBAC boundaries.

**Independent Test**: Compare admin, sales-manager, and sales-executive access to users, audit logs,
and analytics dashboards.

**Acceptance Scenarios**:

1. **Given** a sales-executive user, **When** requesting users or audit logs,
   **Then** the API returns 403.
2. **Given** an admin user, **When** requesting analytics overview,
   **Then** KPI, funnel, and ranking panels are returned successfully.

---

### User Story 4 - Attachment and Notification Workflow (Priority: P4)

Teams upload and view files per lead and receive in-app notifications for assignments,
task changes, follow-up reminders, and dealer status updates.

**Why this priority**: Operational collaboration requires contextual files and timely notifications.

**Independent Test**: Upload an attachment to a lead, retrieve attachment list, trigger assignment/task change,
and verify notification delivery.

**Acceptance Scenarios**:

1. **Given** a lead detail screen, **When** a file is uploaded, **Then** the file appears in lead attachments.
2. **Given** a lead or task reassignment, **When** the update succeeds, **Then** affected users receive notifications.

### Edge Cases

- Duplicate mobile number rows in CSV import MUST be skipped with row-level error reporting.
- Invalid lead source or inquiry type values in CSV import MUST not be inserted.
- Missing or expired auth cookies MUST force 401 and not silently recover via local storage.
- Repeated analytics reads inside cache TTL MUST return cached payloads.
- Uploads with unsupported content type references MUST fail with explicit validation errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support lead intake from website, WhatsApp, direct call, dealer inquiry,
  social media, manual entry, and distributor channels.
- **FR-002**: System MUST maintain a strict lead pipeline:
  `new -> attempted_contact -> contacted -> interested -> negotiation -> dealer_assigned -> converted/lost/closed`.
- **FR-003**: System MUST enforce role-based data visibility for all list and detail APIs.
- **FR-004**: System MUST persist immutable audit records for all create/update/delete operations.
- **FR-005**: System MUST write lead timeline events for status and assignment transitions.
- **FR-006**: System MUST support lead notes and follow-up lifecycle management.
- **FR-007**: System MUST support dealer onboarding workflow from prospect to active.
- **FR-008**: System MUST compute dealer operational metrics from live lead data.
- **FR-009**: System MUST support task workflows linked to leads and dealers.
- **FR-010**: System MUST provide analytics for funnel, territory, product demand, and dealer performance.
- **FR-011**: System MUST cache analytics overview responses for 5 minutes.
- **FR-012**: System MUST support file attachment upload and listing for lead-linked entities.
- **FR-013**: System MUST support in-app notifications for assignment and reminder events.
- **FR-014**: System MUST enforce cookie-based authentication and server-side logout clearing.

### Key Entities *(include if feature involves data)*

- **Lead**: Sales opportunity with identity, source, status, assignment, and product interest.
- **LeadTimelineEvent**: Immutable history event for status, assignment, and related activities.
- **LeadNote**: User-authored contextual note on a lead.
- **FollowUp**: Scheduled customer interaction with channel and status.
- **Dealer**: Partner profile with territory ownership, type/tier, and approval state.
- **Task**: Work item assigned to users and optionally linked to lead/dealer.
- **Notification**: In-app event message sent to affected users.
- **AuditLog**: Immutable write-history record with actor and metadata.
- **Attachment**: File linked to a target entity via polymorphic reference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sales executives can complete the full lead handling flow (create/update/follow-up/close)
  without leaving the platform for spreadsheet fallback.
- **SC-002**: Unauthorized role access to privileged endpoints is blocked in 100% of tested RBAC boundary cases.
- **SC-003**: Analytics overview repeated reads during cache window avoid repeated backend computation.
- **SC-004**: CSV imports report row-level failures and complete successfully for valid rows in the same file.
- **SC-005**: Lead attachment upload and list workflows complete successfully from the lead detail UI.

## Assumptions

- Existing backend and frontend foundations remain in scope and are extended rather than rewritten.
- JWT authentication is cookie-based and remains inaccessible to browser JavaScript.
- Platform remains a single web product with Django REST backend and React frontend.
- Data migration compatibility is preserved for existing deployments.
