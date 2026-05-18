# Implementation Plan: Sigma Audio Dealer & Sales Intelligence Platform

**Branch**: `001-sigma-audio-platform` | **Date**: 2026-05-18 | **Spec**: `specs/001-sigma-audio-platform/spec.md`

**Input**: Feature specification from `/specs/001-sigma-audio-platform/spec.md`

## Summary

Deliver and enforce a production-grade CRM operating model for Sigma Audio covering lead lifecycle,
dealer lifecycle, task/follow-up execution, analytics, auditability, notifications, and file attachments,
with hard RBAC boundaries and cookie-based authentication.

## Technical Context

**Language/Version**: Python 3.13 (backend), JavaScript/JSX with React 18 + Vite (frontend)

**Primary Dependencies**: Django 5.0, Django REST Framework, SimpleJWT, React Query, Zustand, Axios, Tailwind CSS

**Storage**: SQLite (development), MySQL (production), file storage on local disk (`MEDIA_ROOT`)

**Testing**: Django test runner (`python manage.py test`), frontend lint/build (`npm run lint`, `npm run build`)

**Target Platform**: Linux/macOS developer environments, browser-based SPA + REST API

**Project Type**: Web application (Django REST backend + React frontend)

**Performance Goals**:
- Lead list endpoint remains flat query count with no N+1 behavior
- Analytics overview cached for 300 seconds
- Warm analytics reads avoid backend recomputation

**Constraints**:
- JWT via httpOnly cookies only
- Strict RBAC endpoint blocks for non-privileged roles
- Audit + timeline hooks on write and lead lifecycle transitions
- Existing route contracts and aliases must remain stable

**Scale/Scope**:
- Multi-role enterprise CRM
- All core modules (leads, dealers, followups, tasks, analytics, notifications, files, audit, accounts)
- API base `/api/v1/`, auth at `/api/token/*` and `/api/auth/me/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Read-before-write and search-before-create workflow is applied.
- ✅ Backend write hooks defined: audit log mandatory, lead timeline and assignment notifications mandatory.
- ✅ Query discipline defined: role-scoped `get_queryset()`, mandatory `select_related` / `prefetch_related` strategy.
- ✅ Security constraints defined: env-only secret/cors, login throttle, cookie auth.
- ✅ Frontend data constraints defined: React Query staleTime by data class, lazy page routing.
- ✅ Verification pipeline defined in constitution and reflected in tasks.

## Project Structure

### Documentation (this feature)

```text
specs/001-sigma-audio-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── crm-api-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── backend/
├── apps/
│   ├── leads/
│   ├── dealers/
│   ├── analytics/
│   ├── files/
│   ├── notifications/
│   ├── audit/
│   ├── accounts/
│   ├── followups/
│   └── tasks/
└── shared/
    ├── authentication/
    ├── permissions/
    ├── pagination/
    └── models.py

frontend/
└── src/
    ├── app/
    ├── context/
    ├── services/api/
    ├── modules/
    ├── components/
    └── layouts/
```

**Structure Decision**: Use existing web application split (`backend/`, `frontend/`) and implement
incremental hardening and parity fixes against the specification without introducing new root-level services.

## Implementation Phases

1. **Phase 0 — Governance and Spec Alignment**
   - Finalize constitution, specification, and quality checklist.
2. **Phase 1 — Architecture Artifacts**
   - Capture research decisions, data model, API contract, and quickstart verification flow.
3. **Phase 2 — Execution Tasks**
   - Generate actionable tasks mapped to user stories.
4. **Phase 3 — Implement + Validate**
   - Execute tasks in dependency order and mark completion in `tasks.md`.

## Complexity Tracking

No constitution violations are currently accepted for this plan.
