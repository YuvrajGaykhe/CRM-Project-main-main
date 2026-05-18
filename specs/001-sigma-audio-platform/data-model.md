# Data Model: Sigma Audio Dealer & Sales Intelligence Platform

## Lead
- **Purpose**: Primary sales opportunity record.
- **Key fields**: identity/contact, source, inquiry type, status, priority, assigned executive, linked dealer/product.
- **Relations**:
  - One-to-many: `LeadNote`, `LeadTimelineEvent`, `FollowUp`, `Task`
  - Optional foreign keys: `Dealer`, `Product`, `assigned_executive`
- **State transitions**:
  - `new -> attempted_contact -> contacted -> interested -> negotiation -> dealer_assigned -> converted|lost|closed`

## LeadTimelineEvent
- **Purpose**: Immutable event log for lifecycle transitions.
- **Key fields**: lead, action, message, metadata, actor, timestamp.
- **Constraints**: Must be emitted for status and assignment changes.

## Dealer
- **Purpose**: Partner/dealer profile and territory unit.
- **Key fields**: name, region, city/state, tier, type, status, territory manager.
- **Relations**:
  - One-to-many: linked `Lead`, linked `Task`
- **Derived values**:
  - Active lead counts and revenue generated from live lead annotations.

## FollowUp
- **Purpose**: Scheduled customer touchpoint for a lead.
- **Key fields**: lead, channel, scheduled time, status, notes, completion metadata.
- **States**: scheduled, completed, missed, cancelled, rescheduled.

## Task
- **Purpose**: Assignable work item linked to lead/dealer workflows.
- **Key fields**: title, type, priority, due date, assignee, status, linked lead/dealer.

## Notification
- **Purpose**: In-app user alert for assignment/reminder/system events.
- **Key fields**: recipient, type, title, message, payload, read status.

## AuditLog
- **Purpose**: Immutable system-of-record for write operations.
- **Key fields**: actor, action string, entity type/id, request metadata, timestamp.

## Attachment
- **Purpose**: File linked to supported entities.
- **Key fields**: file, filename metadata, content_type/object_id polymorphic target, uploader.
