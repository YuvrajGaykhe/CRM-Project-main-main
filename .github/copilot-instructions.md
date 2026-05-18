<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read:
`specs/001-sigma-audio-platform/plan.md`
---

```markdown
# Sigma Audio CRM — Project Plan
# Read this file whenever <!-- SPECKIT START --> is present in context.

---

## Project Identity

Name:     Sigma Audio Dealer & Sales Intelligence Platform
Type:     Enterprise CRM for automotive audio distribution
Purpose:  Centralise lead management, dealer operations, sales
          workflows, follow-up tracking, and business analytics
          for Sigma Audio's regional distribution network.

---

## Tech Stack

### Backend
| Layer          | Technology                          |
|----------------|-------------------------------------|
| Language       | Python 3.13                         |
| Framework      | Django 5.0                          |
| API            | Django REST Framework               |
| Auth           | SimpleJWT + httpOnly cookie transport |
| Database       | SQLite (dev) · MySQL (prod)         |
| Cache          | LocMemCache (dev) · Redis (prod)    |
| File storage   | Django FileField → MEDIA_ROOT       |
| RBAC           | Role slug system via shared/permissions/rbac.py |

### Frontend
| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | React 18 + Vite                     |
| Language       | JavaScript (JSX)                    |
| Styling        | Tailwind CSS only                   |
| Server state   | React Query (staleTime always set)  |
| UI state       | Zustand                             |
| HTTP           | Axios · withCredentials: true       |
| Routing        | React Router v6 · all pages lazy    |

---

## Project Structure

```
CRM-Project-main-main/
├── backend/
│   ├── backend/
│   │   ├── settings.py          # env-driven · no hardcoded secrets
│   │   ├── urls.py              # root URL config + media serving
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── api/                 # AUTH_USER_MODEL=api.User · legacy models
│   │   ├── accounts/            # Role model · UserViewSet
│   │   ├── leads/               # Lead · LeadNote · LeadTimelineEvent
│   │   ├── dealers/             # Dealer · live-annotated counts
│   │   ├── products/            # Product catalogue
│   │   ├── tasks/               # Task · linked to Lead + Dealer
│   │   ├── followups/           # FollowUp · scheduled/completed/missed
│   │   ├── notifications/       # Notification · create_notification()
│   │   ├── audit/               # AuditLog · log_action()
│   │   ├── files/               # Attachment · GenericForeignKey + FileField
│   │   ├── analytics/           # AnalyticsOverviewAPIView · 5-min cache
│   │   └── integrations/        # Third-party stubs
│   ├── shared/
│   │   ├── models.py            # TimestampedModel · OwnedModel
│   │   ├── permissions/
│   │   │   ├── rbac.py          # SigmaRolePermission · get_role_slug()
│   │   │   └── roles.py         # AdminRoleRequired
│   │   ├── authentication/
│   │   │   ├── cookie_jwt.py    # CookieJWTAuthentication
│   │   │   └── views.py         # Cookie token obtain/refresh/logout views
│   │   ├── pagination/          # SigmaPageNumberPagination
│   │   ├── filters/             # Shared DRF filter backends
│   │   ├── serializers/         # Shared serializer mixins
│   │   └── services/            # Shared service utilities
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # Router · all pages lazy-loaded here
│   │   ├── App.jsx              # Root outlet
│   │   ├── index.css            # Tailwind base
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Cookie auth · no localStorage
│   │   ├── app/
│   │   │   ├── providers/       # AppProviders · QueryProvider
│   │   │   ├── routes/          # ProtectedRoute
│   │   │   └── store/           # uiStore (Zustand)
│   │   ├── components/          # Shared: Dashboard · Navbar · DashboardShell
│   │   ├── components/ui/       # SigmaForm · SigmaModal · StatusBadge · EmptyState
│   │   ├── modules/
│   │   │   ├── leads/           # LeadsListScreen · LeadsKanbanScreen
│   │   │   │   ├── screens/     #   LeadDetailDrawer · LeadsWorkspace
│   │   │   │   ├── components/  #   leadsFiltersStore
│   │   │   │   └── services/    #   leadsApi.js
│   │   │   ├── dealers/         # DealersPage
│   │   │   ├── products/        # ProductsPage
│   │   │   ├── tasks/           # SigmaTasksPage
│   │   │   ├── notifications/   # NotificationsPage
│   │   │   ├── audit/           # AuditLogPage
│   │   │   └── settings/        # SettingsPage
│   │   └── services/
│   │       └── api/
│   │           ├── client.js    # Axios instance · withCredentials:true
│   │           ├── crm.js       # All API functions
│   │           └── index.js     # Re-exports
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── .speckit/
    ├── plan.md                  # ← this file
    ├── constitution.md          # governing principles
    ├── spec.md                  # what to build
    └── tasks.md                 # current task list
```

---

## Shell Commands

### Backend setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Required env vars before any command
export DJANGO_SECRET_KEY='your-secret-key-here'
export DJANGO_ALLOWED_HOSTS='localhost,127.0.0.1'
export CORS_ALLOWED_ORIGINS='http://localhost:5173'
```

### Backend development
```bash
# Check for errors (run after every change)
python manage.py check

# Run all migrations
python manage.py migrate

# Create migration for a specific app
python manage.py makemigrations <app_name>

# Verify no unapplied or missing migrations
python manage.py makemigrations --check
python manage.py showmigrations | grep "\[ \]"

# Run tests
python manage.py test

# Start dev server
python manage.py runserver

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

### Frontend setup
```bash
cd frontend
npm install
```

### Frontend development
```bash
# Start dev server
npm run dev

# Lint (run after every frontend change)
npm run lint

# Production build (must be clean before marking done)
npm run build

# Preview production build
npm run preview
```

### Full verification sequence (run in this order after every task)
```bash
cd backend && python manage.py check
cd backend && python manage.py makemigrations --check
cd backend && python manage.py test
cd frontend && npm run lint
cd frontend && npm run build
```

---

## Environment Variables

### Backend (.env)
```bash
DJANGO_SECRET_KEY=          # required · no fallback · crash if missing
DJANGO_DEBUG=               # True (dev) · False (prod)
DJANGO_ALLOWED_HOSTS=       # comma-separated · localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=       # comma-separated · http://localhost:5173
DATABASE_URL=               # optional · falls back to SQLite
MYSQL_DATABASE=             # prod database name
MYSQL_USER=                 # prod database user
MYSQL_PASSWORD=             # prod database password
MYSQL_HOST=                 # prod database host
MYSQL_PORT=                 # prod database port (default 3306)
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api   # backend base URL
```

---

## API Contracts

### Auth endpoints
```
POST /api/token/              Login  → sets access_token + refresh_token cookies
POST /api/token/refresh/      Refresh → rotates access_token cookie
POST /api/token/logout/       Logout → clears both cookies server-side
GET  /api/auth/me/            Current user profile
```

### Core resource endpoints
```
/api/v1/leads/                GET (list) · POST (create)
/api/v1/leads/{id}/           GET · PUT · PATCH · DELETE
/api/v1/leads/{id}/move/      POST  { status: "contacted" }
/api/v1/leads/{id}/notes/     GET (list) · POST (create)
/api/v1/leads/{id}/timeline/  GET (list)
/api/v1/leads/import_csv/     POST multipart/form-data
/api/v1/leads/export_csv/     GET → StreamingHttpResponse

/api/v1/dealers/              GET · POST · PUT · PATCH · DELETE
/api/v1/products/             GET · POST · PUT · PATCH · DELETE
/api/v1/tasks/                GET · POST · PUT · PATCH · DELETE
/api/v1/followups/            GET · POST · PUT · PATCH · DELETE
/api/v1/notifications/        GET · POST · PATCH (mark_read)
/api/v1/audit-logs/           GET (admin + manager only)
/api/v1/files/                GET (filter by content_type + object_id) · POST
/api/v1/analytics/overview/   GET (cached 5 min)
/api/v1/users/                GET (admin + manager only)

# Alias routes (map to real routes above)
/api/v1/accounts/users/  →  /api/v1/users/
/api/v1/accounts/roles/  →  /api/auth/roles/
/api/v1/audit/           →  /api/v1/audit-logs/
```

---

## RBAC Model

```
Role slug          Leads          Dealers        Users    Audit
─────────────────────────────────────────────────────────────────
super-admin        all            all            ✓        ✓
admin              all            all            ✓        ✓
sales-manager      all            all            ✓        ✓
dealer-manager     assigned       all            ✗        ✗
sales-executive    OWN ONLY       read           ✗        ✗
support-staff      read           read           ✗        ✗
```

**Hard RBAC rules — always verified:**
```
sales-executive → GET /api/v1/audit-logs/  must return 403
sales-executive → GET /api/v1/users/       must return 403
sales-executive → GET /api/v1/leads/       must return 200 (own leads only)
admin           → GET /api/v1/leads/       must return 200 (all leads)
```

---

## Data Model Quick Reference

### Lead
```python
STATUS:   new · attempted_contact · contacted · interested ·
          negotiation · dealer_assigned · converted · lost · closed

SOURCE:   website_form · whatsapp · dealer_inquiry · distributor ·
          direct_call · manual_entry · social_media

INQUIRY:  product · dealer · distributor · support · brochure

PRIORITY: low · medium · high · urgent
```

### Dealer
```python
STATUS: prospect · pending_approval · active · inactive · suspended
TIER:   platinum · gold · silver · bronze · prospect
TYPE:   dealer · distributor · retailer · installer · fleet_partner
```

### FollowUp
```python
STATUS:  scheduled · completed · missed · cancelled · rescheduled
CHANNEL: call · whatsapp · email · meeting · site_visit
```

### Task
```python
STATUS:   todo · in_progress · blocked · done · cancelled
PRIORITY: low · medium · high · urgent
TYPE:     followup · callback · meeting · dealer_onboarding · support · internal
```

---

## Required Hooks on Every Write

Every create, update, delete must include ALL applicable hooks.

```python
# A — Audit log (every write)
from apps.audit.services import log_action
log_action(request.user, "entity.verb", instance, request=request)
# verb examples: created · updated · deleted · status_changed · approved

# B — Timeline event (Lead status change)
from apps.leads.services import create_timeline_event
create_timeline_event(
    lead=lead,
    action="lead.status_changed",
    message=f"Status changed from {old} to {new}.",
    metadata={"from": old, "to": new},
    user=request.user,
)

# C — Timeline event (Lead assignment change)
create_timeline_event(
    lead=lead,
    action="lead.reassigned",
    message=f"Lead reassigned to {lead.assigned_executive}.",
    metadata={"assignee_id": str(lead.assigned_executive_id)},
    user=request.user,
)

# D — Assignment notification
from apps.leads.services import notify_assignment
notify_assignment(lead)

# E — General notification (changes affecting other users)
from apps.notifications.services import create_notification
create_notification(
    user=affected_user,
    notification_type="task_assigned",
    title="...",
    message="...",
    payload={"entity_id": str(instance.id)},
)
```

---

## Coding Patterns

### New model (backend)
```python
from shared.models import OwnedModel

class MyModel(OwnedModel):
    # Inherits: created_at, updated_at, created_by, updated_by
    name = models.CharField(max_length=160, db_index=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]
```

### New viewset (backend)
```python
class MyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, MyPermission]
    pagination_class = SigmaPageNumberPagination

    def get_queryset(self):
        return MyModel.objects.select_related("created_by").order_by("-created_at")

    def perform_create(self, serializer):
        instance = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )
        log_action(self.request.user, "mymodel.created", instance, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, "mymodel.updated", instance, request=self.request)

    def perform_destroy(self, instance):
        log_action(self.request.user, "mymodel.deleted", instance, request=self.request)
        instance.delete()
```

### New API call (frontend)
```javascript
// In services/api/crm.js
export const getMyData = (params) =>
    apiClient.get('/v1/my-endpoint/', { params })

export const createMyRecord = (data) =>
    apiClient.post('/v1/my-endpoint/', data)
```

### New page (frontend)
```jsx
// 1. Create the component in modules/my/MyPage.jsx
// 2. Register in main.jsx — lazy only
const MyPage = lazy(() => import('./modules/my/MyPage.jsx'))

// 3. Add the route inside <ProtectedRoute />
<Route path="my-page" element={<LazyRoute><MyPage /></LazyRoute>} />

// 4. React Query with staleTime
const { data } = useQuery({
    queryKey: ['my-data'],
    queryFn: () => getMyData(),
    staleTime: 30_000,
})
```

---

## Performance Thresholds

| Metric                        | Limit       | Verify with              |
|-------------------------------|-------------|--------------------------|
| List endpoint DB queries      | ≤ 5         | CaptureQueriesContext    |
| Lead list query scaling       | Flat (no N+1)| Same count: 10 vs 500   |
| Analytics cold cache          | ≤ 8 queries | CaptureQueriesContext    |
| Analytics warm cache          | 0 queries   | Second request           |
| React Query staleTime         | ≥ 30,000ms  | grep staleTime src/      |
| Heavy imports (recharts etc.) | Lazy only   | grep top-level imports   |

---

## Security Checklist

- [ ] JWT in httpOnly cookies — never localStorage
- [ ] SECRET_KEY from os.environ["DJANGO_SECRET_KEY"] — no fallback
- [ ] CORS from CORS_ALLOWED_ORIGINS env var — not hardcoded
- [ ] Login throttled: LoginRateThrottle 10/min on /api/token/
- [ ] Exec cannot access /api/v1/audit-logs/ → must 403
- [ ] Exec cannot access /api/v1/users/ → must 403
- [ ] Files stored via FileField — not URLField
- [ ] STATIC_ROOT = BASE_DIR / "staticfiles"
- [ ] MEDIA_ROOT = BASE_DIR / "media"

---

## What Not To Do

```
✗  Lead.objects.all() in any view
✗  instance.save() without update_fields on targeted updates
✗  localStorage for any auth token
✗  Authorization: Bearer header in axios
✗  inline style={} in React unless JS-computed dynamic value
✗  font-weight 600 or 700 anywhere in the UI
✗  SerializerMethodField that hits the DB on list views
✗  select_related missing for any FK accessed in a serializer
✗  prefetch_related missing for any reverse relation in a serializer
✗  New model that extends models.Model directly (use OwnedModel)
✗  New app not registered in settings.INSTALLED_APPS
✗  Model change without running makemigrations
✗  Editing an existing migration file
✗  Changing AUTH_USER_MODEL (frozen — api.User)
✗  Deleting a migration file
✗  Skipping log_action() on any write operation
✗  Skipping create_timeline_event() on Lead status change
✗  Skipping notify_assignment() on Lead assignment change
✗  Heavy library (recharts, d3, lodash) imported at module top level
```

---

## Completed Work (do not redo)

| # | What was done |
|---|---------------|
| 001 | settings.py hardened: secret key crash-guard · CORS from env · STATIC_ROOT · login rate limit |
| 002 | CSV import: mobile dedup · choice validation · structured {imported, skipped, errors} response |
| 003 | LeadViewSet: action-scoped prefetch_related · N+1 eliminated |
| 004 | Dealer counts: live annotations via Count+Sum · deprecated stale model fields |
| 005 | Analytics: 15→8→0 queries · 5-min LocMemCache · payload parity verified |
| 006 | File storage: URLField→FileField · migration · MEDIA_ROOT · media URL serving |
| 007 | JWT: localStorage→httpOnly cookies · CookieJWTAuthentication · silent refresh · logout |
| 008 | Integration audit: 6 issues found across RBAC · routing · frontend wiring |
| 009-A | RBAC: exec blocked from audit-logs + users with AuditReadPermission + ManagementReadPermission |
| 009-B | URL aliases registered: /api/v1/accounts/users/ · /api/v1/accounts/roles/ · /api/v1/audit/ |
| 009-C | Lead actions: move endpoint (POST) · notes GET added · timeline events + audit on both |
| 009-D | Frontend: uploadAttachment() + getAttachments() wired · LeadDetailDrawer renders attachments |

---

## Current Status

All P0 and P1 issues resolved. System passes full integration audit:
- Every module: backend ✓ · RBAC ✓ · frontend wired ✓ · data clean ✓
- Zero unapplied migrations
- Frontend build: clean
- RBAC boundaries: verified

Next work areas:
- Performance optimisation (query profiling baseline pending)
- Docker + docker-compose setup
- Test suite (zero tests currently — all RBAC boundaries need coverage)
```

---

<!-- SPECKIT END -->
