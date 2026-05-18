<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles: Template placeholders -> Sigma Audio production rules
- Added sections: Code Quality, Required Hooks, Testing Standards, Performance, Security, UX, Architecture Reference
- Removed sections: Placeholder-only template blocks
- Templates requiring updates: ⚠ pending (.specify/templates/spec-template.md, .specify/templates/plan-template.md, .specify/templates/tasks-template.md)
- Deferred TODOs: none
-->

# Sigma Audio Dealer & Sales Intelligence Platform Constitution

## Core Principles

### I. Read Before Write
Before changing any file, the agent MUST read that file in full in the current working tree.
Edits based on assumptions or stale memory are non-compliant.

### II. Search Before Create
Before adding a new utility, service, serializer, permission, or component, the agent MUST
search the repository for an existing equivalent and reuse it when possible.
Known shared integrations that MUST be reused when applicable:
- `log_action()` (`apps/audit/services.py`)
- `create_timeline_event()` and `notify_assignment()` (`apps/leads/services.py`)
- `create_notification()` (`apps/notifications/services.py`)
- `get_role_slug()` and `is_platform_admin()` (`shared/permissions/rbac.py`)
- `SigmaPageNumberPagination`, `TimestampedModel`, `OwnedModel`

### III. Plan Before Code
For any multi-file or multi-phase change, the agent MUST produce a numbered plan before edits.
The plan MUST include: touched files, side effects (migrations/routes/hooks), and verification steps.

### IV. Targeted Persistence Only
Any partial model update MUST use `save(update_fields=[...])`.
Calling `save()` without `update_fields` on partial updates is non-compliant.

### V. Role-Scoped Querysets and Query Discipline
Lead querysets in views MUST be role-scoped in `get_queryset()` only.
`sales-executive` users MUST only see leads where `assigned_executive == request.user`,
unless `is_platform_admin(request.user)` is true.
`Lead.objects.all()` in views is non-compliant.

## Required Hooks (Non-Negotiable)

### Audit Hook
Every backend write (`create`, `update`, `delete`) MUST call:
`log_action(request.user, "<entity>.<verb>", instance, request=request)`.

### Lead Timeline Hooks
For any Lead status change, code MUST create:
`create_timeline_event(..., action="lead.status_changed", metadata={"from": old, "to": new}, user=request.user)`.

For any Lead assignment change, code MUST create:
`create_timeline_event(..., action="lead.reassigned", metadata={"assignee_id": str(lead.assigned_executive_id)}, user=request.user)`.

### Assignment Notification Hooks
For assignment or reassignment, code MUST call `notify_assignment(lead)`.
For updates affecting another user, code MUST call `create_notification(...)` for that user.

## Testing Standards

- Every new endpoint MUST include three tests minimum:
  1. admin smoke (2xx)
  2. unauthenticated request (401)
  3. unauthorized role (403)
- Every backend change MUST pass this verification sequence in order:
  1. `python manage.py check`
  2. `python manage.py makemigrations --check`
  3. `python manage.py test`
  4. `cd frontend && npm run lint`
  5. `cd frontend && npm run build`
- RBAC boundary checks that MUST remain true:
  - sales-executive: `/api/v1/audit-logs/` -> 403
  - sales-executive: `/api/v1/users/` -> 403
  - sales-executive: `/api/v1/leads/` -> 200 (own leads only)
  - sales-manager: `/api/v1/audit-logs/` -> 200
  - sales-manager: `/api/v1/users/` -> 200
  - admin: `/api/v1/leads/` -> 200 (all leads)

## Performance and Security Requirements

- List endpoints MUST avoid N+1; serializer-referenced FK fields require `select_related()`;
  serializer-referenced reverse relations require `prefetch_related()`.
- `retrieve()` may prefetch reverse relations (`followups`, `lead_notes`, `timeline`); `list()`
  MUST only prefetch reverse relations when list serializers read them.
- Analytics overview responses MUST use cache key `ANALYTICS_OVERVIEW_CACHE_KEY` with TTL 300s.
- Authentication tokens MUST remain in httpOnly cookies only; no localStorage token storage.
- `SECRET_KEY` MUST be loaded as `os.environ["DJANGO_SECRET_KEY"]` with no fallback.
- `CORS_ALLOWED_ORIGINS` MUST come from environment variable parsing only.
- Login endpoint `/api/token/` MUST be throttled to `10/min` with `LoginRateThrottle`.
- File uploads MUST use `FileField(upload_to="attachments/%Y/%m/")`.

## UX and Frontend Consistency

- Before creating UI primitives, the agent MUST check and reuse `components/ui/` primitives:
  `SigmaForm`, `SigmaModal`, `StatusBadge`, and `EmptyState`.
- Status color logic MUST be centralized in `StatusBadge`; components MUST NOT hardcode status colors.
- Empty/zero/error list states MUST use `EmptyState`.
- Page-level route components MUST be lazy-loaded in `main.jsx` and protected pages MUST be under `ProtectedRoute`.
- API calls MUST use `services/api/client.js` and `services/api/crm.js`; raw `fetch()` and extra Axios instances are non-compliant.
- React Query queries MUST define category-correct `staleTime`:
  - standard CRM data: `30_000`
  - analytics data: `300_000`
  - user/role data: `60_000`

## Governance

- This constitution supersedes ad hoc implementation habits.
- Any PR affecting backend writes, lead lifecycle transitions, auth, RBAC, or analytics cache MUST
  be reviewed against all applicable clauses above.
- Amendments require:
  1. a documented reason,
  2. explicit version bump rationale (semver),
  3. updates to relevant templates and guidance files.
- Compliance review is mandatory in planning and in final verification notes.

**Version**: 1.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-18
