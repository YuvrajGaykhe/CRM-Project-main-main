# API Contract (High-Level): Sigma Audio CRM

## Authentication

- `POST /api/token/` — login, sets `access_token` + `refresh_token` httpOnly cookies
- `POST /api/token/refresh/` — rotate cookies
- `POST /api/token/logout/` — clear auth cookies
- `GET /api/auth/me/` — current authenticated user profile

## Core Business Endpoints

- `GET|POST /api/v1/leads/`
- `GET|PATCH|DELETE /api/v1/leads/{id}/`
- `POST /api/v1/leads/import_csv/`
- `GET /api/v1/leads/export_csv/`
- `POST /api/v1/leads/{id}/move/`
- `GET|POST /api/v1/leads/{id}/notes/`

- `GET|POST /api/v1/dealers/`
- `GET|PATCH|DELETE /api/v1/dealers/{id}/`

- `GET|POST /api/v1/followups/`
- `GET|PATCH|DELETE /api/v1/followups/{id}/`

- `GET|POST /api/v1/tasks/`
- `GET|PATCH|DELETE /api/v1/tasks/{id}/`

- `GET /api/v1/analytics/overview/`
- `GET /api/v1/audit-logs/`
- `GET /api/v1/users/`

- `GET|POST /api/v1/files/`

## Alias Endpoints (must remain compatible)

- `/api/v1/accounts/users/` -> `/api/v1/users/`
- `/api/v1/accounts/roles/` -> `/api/auth/roles/`
- `/api/v1/audit/` -> `/api/v1/audit-logs/`

## Authorization Guarantees

- sales-executive:
  - allowed: own leads and related follow-up/notes operations
  - denied (403): `/api/v1/users/`, `/api/v1/audit-logs/`
- sales-manager/admin/super-admin: elevated operational and reporting access
- support-staff: read-only scope on allowed domains

## Write-Side Hook Guarantees

- All write operations produce an audit record.
- Lead status and assignment changes produce timeline entries.
- Assignment changes produce assignment notifications.
