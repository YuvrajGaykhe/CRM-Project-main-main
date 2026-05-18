# Tasks: Sigma Audio Dealer & Sales Intelligence Platform

**Input**: Design documents from `/specs/001-sigma-audio-platform/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create feature artifacts in `specs/001-sigma-audio-platform/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`)
- [x] T002 Create requirements checklist at `specs/001-sigma-audio-platform/checklists/requirements.md`
- [x] T003 Persist feature directory in `.specify/feature.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 Align project constitution in `.specify/memory/constitution.md` with machine-checkable production rules
- [x] T005 Update Speckit agent context plan reference in `.github/copilot-instructions.md`

---

## Phase 3: User Story 1 - Unified Lead Operations (Priority: P1) 🎯 MVP

**Goal**: Keep lead workflow behavior and RBAC boundaries compliant with the constitution.

**Independent Test**: Sales-executive sees own leads and remains blocked from privileged endpoints.

- [x] T006 [US1] Preserve lead workflow contracts in `backend/apps/leads/views.py` (`move`, `notes`, csv import guardrails)
- [x] T007 [US1] Preserve RBAC protections in `backend/apps/accounts/views.py` and `backend/apps/audit/views.py`

---

## Phase 4: User Story 3 - Role-Based Leadership Visibility (Priority: P3)

**Goal**: Keep analytics and leadership views performant and role-safe.

**Independent Test**: Admin/manager analytics works; restricted users remain blocked.

- [x] T008 [US3] Apply analytics-specific React Query staleTime (`300_000`) in `frontend/src/components/AnalyticsDashboard.jsx`
- [x] T009 [US3] Apply analytics/query staleTime to enterprise dashboard query in `frontend/src/components/Dashboard.jsx`

---

## Phase 5: User Story 4 - Attachment and Notification Workflow (Priority: P4)

**Goal**: Keep lead attachment flow wired and cache behavior stable.

**Independent Test**: Lead attachment upload/list works through frontend APIs.

- [x] T010 [US4] Apply standard data staleTime (`30_000`) to product catalog query in `frontend/src/modules/products/ProductsPage.jsx`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 Run backend verification commands from `backend/` (`check`, `makemigrations --check`, `test`)
- [x] T012 Run frontend verification commands from `frontend/` (`npm run lint`, `npm run build`)
- [x] T013 Mark completed tasks and finalize this tasks file
