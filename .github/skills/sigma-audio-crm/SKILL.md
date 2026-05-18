---
name: sigma-audio-crm
description: Use this skill for ALL development, debugging, review, refactoring, feature building, and integration work on the Sigma Audio Dealer & Sales Intelligence Platform. Trigger whenever the user mentions leads, dealers, follow-ups, RBAC, CRM, audit logs, Kanban pipeline, analytics, sales executive, Django backend, React frontend, or anything related to Sigma Audio's operational system. Also trigger for tasks like "add a feature", "fix this bug", "write a migration", "add an endpoint", "wire the frontend", "check permissions", or "optimise this query" when working in this codebase. When in doubt, use this skill — it encodes years of project-specific decisions that general knowledge does not.

---

Sigma Audio CRM — Agent Skill
Enterprise-grade CRM for Sigma Audio's automotive audio distribution
network. Django REST backend + React/Vite frontend. Every task follows
a strict read → plan → implement → verify → report cycle.

Shell command rules
- Always use `python3` for Django/venv commands; never use bare `python`.
- Keep `.env` local only and never commit it.
- Verify `.env` is not in history with:
  `git log --all --full-history -- "backend/.env"`.

Codebase Map
backend/
  backend/         settings.py · urls.py · wsgi.py · asgi.py
  apps/
    api/           AUTH_USER_MODEL=api.User · legacy models (do not add new models here)
    accounts/      Role model · UserViewSet
    leads/         Lead · LeadNote · LeadTimelineEvent · LeadViewSet
    dealers/       Dealer (live-annotated counts) · DealerViewSet
    products/      Product · ProductViewSet
    tasks/         Task · TaskViewSet
    followups/     FollowUp · FollowUpViewSet
    notifications/ Notification · create_notification()
    audit/         AuditLog · log_action()
    files/         Attachment (GenericForeignKey + FileField)
    analytics/     AnalyticsOverviewAPIView (5-min cache)
    integrations/  Third-party stubs
  shared/
    models.py              TimestampedModel · OwnedModel
    permissions/rbac.py    SigmaRolePermission · LeadPermission · get_role_slug()
    authentication/        CookieJWTAuthentication · cookie token views
    pagination/            SigmaPageNumberPagination

frontend/
  src/
    main.jsx                    Router · lazy imports · route tree
    context/AuthContext.jsx     Cookie-based auth · no localStorage
    services/api/client.js      Axios · withCredentials:true · no Auth header
    services/api/crm.js         All API functions
    modules/leads/services/     leadsApi.js (lead-scoped wrappers)
    app/routes/ProtectedRoute   RBAC route guard
    app/store/uiStore.js        Zustand UI state
    components/ui/              SigmaForm · SigmaModal · StatusBadge · EmptyState

Domain Reference
Lead.STATUS_CHOICES (exact slugs — validate against these):
new | attempted_contact | contacted | interested |
negotiation | dealer_assigned | converted | lost | closed
Lead.SOURCE_CHOICES:
website_form | whatsapp | dealer_inquiry | distributor |
direct_call | manual_entry | social_media
Lead.INQUIRY_TYPE_CHOICES:
product | dealer | distributor | support | brochure
Lead.PRIORITY_CHOICES: low | medium | high | urgent
Dealer.STATUS_CHOICES: prospect | pending_approval | active | inactive | suspended
Dealer.TIER_CHOICES: platinum | gold | silver | bronze | prospect
FollowUp.STATUS_CHOICES: scheduled | completed | missed | cancelled | rescheduled
FollowUp.CHANNEL_CHOICES: call | whatsapp | email | meeting | site_visit
Task.STATUS_CHOICES: todo | in_progress | blocked | done | cancelled
RBAC roles (exact slugs):
super-admin     full access · is_superuser
admin           full access · is_staff
sales-manager   leads + dealers + analytics + users + audit
dealer-manager  dealers + assigned leads
sales-executive OWN assigned leads ONLY
support-staff   read-only on leads + notifications
Key permission classes:
pythonLeadPermission           shared/permissions/rbac.py
DealerPermission         shared/permissions/rbac.py
TaskPermission           shared/permissions/rbac.py
AnalyticsPermission      shared/permissions/rbac.py
AuditReadPermission      apps/audit/views.py
ManagementReadPermission apps/accounts/views.py
URL contracts:
POST /api/token/                    login  → sets httpOnly cookies
POST /api/token/refresh/            refresh → rotates cookies
POST /api/token/logout/             logout → clears cookies
GET  /api/auth/me/                  current user profile
GET/POST /api/v1/leads/             list + create
POST /api/v1/leads/{id}/move/       Kanban status change
GET/POST /api/v1/leads/{id}/notes/  lead notes
GET /api/v1/leads/{id}/timeline/    lead timeline
GET /api/v1/dealers/                annotated list
GET /api/v1/products/
GET /api/v1/tasks/
GET /api/v1/followups/
GET /api/v1/notifications/
GET /api/v1/audit-logs/             admin + manager only
GET /api/v1/files/                  filter by content_type + object_id
GET /api/v1/analytics/overview/     cached 5 min
GET /api/v1/users/                  admin + manager only

Aliases active:
/api/v1/accounts/users/  → /api/v1/users/
/api/v1/accounts/roles/  → /api/auth/roles/
/api/v1/audit/           → /api/v1/audit-logs/

Task Execution Protocol
Every task follows these 5 steps. Do not skip any.
Step 1 — Understand
Before writing a single line:

Restate the task in plain English
List every file that will be touched
List every side effect: migrations · new routes · audit hooks ·
timeline events · notifications
If anything is ambiguous: ask ONE focused question, then wait

Step 2 — Plan
Write a numbered plan. Example:
1. Read apps/leads/views.py in full
2. Add @action move() to LeadViewSet
3. Validate status against Lead.STATUS_CHOICES → 400 on invalid
4. Save lead with update_fields=["status", "updated_by"]
5. create_timeline_event() for status change
6. log_action() for audit trail
7. Return LeadSerializer(lead).data
8. Run manage.py check + test + npm lint
Step 3 — Implement
Execute the plan one numbered step at a time.
After each file edit, state: what changed · why · what it affects.
Step 4 — Verify
Run these checks in exact order. All must pass before reporting done:
bash# Backend
python3 manage.py check                    # must be 0 issues
python3 manage.py makemigrations --check   # must be clean
python3 manage.py test                     # must pass all

# Frontend
cd frontend && npm run lint               # must be 0 errors
cd frontend && npm run build              # must compile clean
For any RBAC-touching change, run the boundary probe:
python# These must always hold
exec | GET /api/v1/audit-logs/ → 403
exec | GET /api/v1/users/      → 403
exec | GET /api/v1/leads/      → 200 (own leads only)
admin| GET /api/v1/leads/      → 200 (all leads)
For any queryset change, verify no N+1:
pythonwith CaptureQueriesContext(connection) as ctx:
    resp = client.get("/api/v1/leads/")
assert len(ctx) <= 5, f"N+1 detected: {len(ctx)} queries"
Step 5 — Report
Summary:    one sentence — what changed and why
Files:      every file created or modified
Migrations: every migration generated (name + app)
Hooks:      audit ✓/✗  · timeline ✓/✗  · notification ✓/✗
Checks:     manage.py check ✓ · makemigrations ✓ · test ✓ · lint ✓ · build ✓
Gaps:       any known limitations or follow-up work

Required Hooks — Never Skip These
Every write operation must include ALL applicable hooks.
A task is not done until every required hook is present.
A — Audit log (every create, update, delete)
pythonfrom apps.audit.services import log_action
log_action(request.user, "entity.verb", instance, request=request)

# Action string format: "<model>.<verb>"
# Examples: "lead.created" · "lead.updated" · "lead.status_changed"
#           "dealer.approved" · "task.completed" · "followup.rescheduled"
B — Timeline event (every Lead status change)
pythonfrom apps.leads.services import create_timeline_event
create_timeline_event(
    lead=lead,
    action="lead.status_changed",
    message=f"Status changed from {old_status} to {lead.status}.",
    metadata={"from": old_status, "to": lead.status},
    user=request.user,
)
C — Timeline event (every Lead assignment change)
pythoncreate_timeline_event(
    lead=lead,
    action="lead.reassigned",
    message=f"Lead reassigned to {lead.assigned_executive}.",
    metadata={"assignee_id": str(lead.assigned_executive_id)},
    user=request.user,
)
D — notify_assignment (every Lead assignment or reassignment)
pythonfrom apps.leads.services import notify_assignment
notify_assignment(lead)
E — create_notification (changes affecting other users)
pythonfrom apps.notifications.services import create_notification
create_notification(
    user=affected_user,
    notification_type="task_assigned",  # or "lead_assignment", "dealer_update"
    title="...",
    message="...",
    payload={"entity_id": str(instance.id)},
)

Coding Rules
Backend
python# 1. All new models extend OwnedModel or TimestampedModel
class MyModel(OwnedModel):     # gets created_at, updated_at, created_by, updated_by
    ...

# 2. All views require permission_classes
class MyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, MyPermission]

# 3. Role-scoped querysets — never Lead.objects.all() in a view
def get_queryset(self):
    qs = Lead.objects.select_related("assigned_executive", "interested_product")
    if get_role_slug(self.request.user) == "sales-executive":
        qs = qs.filter(assigned_executive=self.request.user)
    return qs

# 4. Targeted saves only
lead.save(update_fields=["status", "updated_by", "updated_at"])

# 5. Action-scoped prefetch
def get_queryset(self):
    qs = Lead.objects.select_related(...)
    if self.action == "retrieve":
        qs = qs.prefetch_related("followups", "lead_notes", "timeline")
    return qs

# 6. perform_create / perform_update pattern
def perform_create(self, serializer):
    instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
    log_action(self.request.user, "entity.created", instance, request=self.request)

# 7. New apps go in settings.INSTALLED_APPS
# 8. New model changes get a migration
#    python3 manage.py makemigrations <app_name>
Frontend
typescript// 1. All API calls through the axios instance
import apiClient from '@/services/api/client'
// Never: fetch(), new axios.create(), raw XMLHttpRequest

// 2. Server state = React Query, staleTime always set
const { data } = useQuery({
    queryKey: ['leads'],
    queryFn: () => apiClient.get('/v1/leads/'),
    staleTime: 30_000,         // standard data
    // staleTime: 300_000      // analytics data
    // staleTime: 60_000       // user/role data
})

// 3. UI state = Zustand
import { useUIStore } from '@/app/store/uiStore'

// 4. All pages lazy-loaded in main.jsx
const MyPage = lazy(() => import('./modules/my/MyPage'))

// 5. Protected routes wrapped
<Route element={<ProtectedRoute />}>
    <Route path="my-page" element={<LazyRoute><MyPage /></LazyRoute>} />
</Route>

// 6. Use components/ui/ before building new
import { SigmaModal } from '@/components/ui/SigmaModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'

// 7. No Authorization header — cookies handle auth
// axios instance already has withCredentials: true
// Do NOT add: config.headers.Authorization = `Bearer ${token}`

// 8. File upload
const uploadAttachment = (contentType, objectId, fileType, file) => {
    const form = new FormData()
    form.append('content_type', contentType)
    form.append('object_id', objectId)
    form.append('file_type', fileType)
    form.append('file', file)
    return apiClient.post('/v1/files/', form)
}

Performance Rules
RuleThresholdHow to checkList endpoint queries≤ 5CaptureQueriesContextLead list query scalingFlat (N+1 = fail)10 leads == 50 leads query countAnalytics cold cache≤ 8 queriesCaptureQueriesContextAnalytics warm cache0 queriesSecond request same sessionReact Query staleTime≥ 30_000msgrep staleTime in all useQuery callsHeavy importsMust be lazygrep recharts/lodash/d3 in module tops

Security Rules
RuleDetailsJWT storagehttpOnly cookies ONLY · zero localStorageSecret keyos.environ["DJANGO_SECRET_KEY"] · no fallbackCORS originsParsed from CORS_ALLOWED_ORIGINS env varLogin throttle10/min via LoginRateThrottle on /api/token/Exec RBACaudit-logs → 403 · users → 403 · alwaysFile storageFileField(upload_to="attachments/%Y/%m/")

Hard Stops
Stop and ask before proceeding if the task requires:

Dropping a database column or table
Deleting records (bulk or individual) programmatically
Changing AUTH_USER_MODEL (frozen — never change after init)
Removing a migration file (migrations are permanent)
Disabling or weakening RBAC on any endpoint
Storing tokens in localStorage

If manage.py check returns any error → do not proceed.
If RBAC probe shows exec getting 200 on audit/users → fix before reporting done.

Anti-Pattern Registry
These bugs have been fixed. Never reintroduce them.
Anti-patternWas inStatusJWT in localStorageclient.js + AuthContext✅ Fixed: httpOnly cookiesHardcoded SECRET_KEY fallbacksettings.py✅ Fixed: os.environ["DJANGO_SECRET_KEY"]CORS origins hardcodedsettings.py✅ Fixed: env var parsedNo STATIC_ROOTsettings.py✅ Fixed: BASE_DIR / "staticfiles"No login rate limitsettings.py + urls.py✅ Fixed: LoginRateThrottle 10/minCSV import: no deduplicationleads/views.py✅ Fixed: mobile_number uniquenessCSV import: no choice validationleads/views.py✅ Fixed: SOURCE + INQUIRY_TYPE validatedN+1 in LeadViewSetleads/views.py✅ Fixed: select/prefetch_relatedStale dealer active_leads_countdealers/views.py✅ Fixed: live annotations15 analytics queriesanalytics/views.py✅ Fixed: 8 cold · 0 warm cachedFile uploads as URLFieldfiles/models.py✅ Fixed: FileField + migrationExec accessing audit-logsaudit/views.py✅ Fixed: AuditReadPermissionExec accessing usersaccounts/views.py✅ Fixed: ManagementReadPermission/api/v1/accounts/* → 404urls.py✅ Fixed: alias routes registeredLead move endpoint missingleads/views.py✅ Fixed: @action move()Lead notes GET → 405leads/views.py✅ Fixed: GET + POST on notesFrontend not calling /api/v1/files/crm.js + leadsApi.js✅ Fixed: uploadAttachment + getAttachmentsprofile.save() on every user saveapi/models.py signal⚠️ Deprecated — do not triggerLead.objects.all() in viewsmultiple✅ Fixed: always role-scoped

Completed Task Log
Reference this when checking what's already done before planning new work.
TaskScopeOutcome001settings.py hardeningSecret key · CORS env · STATIC_ROOT · rate limit002CSV lead importDedup + choice validation + structured errors003LeadViewSet prefetchAction-scoped · N+1 eliminated004Dealer live annotationsactive_leads_count + revenue_generated live005Analytics optimisation15 → 8 → 0 queries · 5-min cache006File storageFileField · migration · media serving007JWT → httpOnly cookiesCookieJWT · no localStorage · silent refresh008Integration audit6 issues found across RBAC + routing + wiring009-ARBAC lockExec blocked from audit + user list009-BURL contractsAlias routes · ordering warning fixed009-CLead actionsmove endpoint · notes GET added009-DFile wiringFrontend uploadAttachment + getAttachments

Shared Service Signatures
Copy these exactly — do not invent variations.
python# Audit
from apps.audit.services import log_action
log_action(user, action_str, instance=None, metadata=None, request=None)
# Returns: AuditLog instance

# Timeline
from apps.leads.services import create_timeline_event
create_timeline_event(lead, action, message="", metadata=None, user=None)
# Returns: LeadTimelineEvent instance

# Assignment notification
from apps.leads.services import notify_assignment
notify_assignment(lead)
# Returns: Notification instance or None

# Lead from inquiry
from apps.leads.services import create_lead_from_inquiry
create_lead_from_inquiry(payload_dict, source="website_form")
# Returns: Lead instance (with timeline + notification)

# Notification
from apps.notifications.services import create_notification
create_notification(user, notification_type, title, message="", payload=None)
# Returns: Notification instance or None

# Role helpers
from shared.permissions.rbac import get_role_slug, is_platform_admin
get_role_slug(user)       # → "sales-executive" | "admin" | None
is_platform_admin(user)   # → True if superuser/staff/super-admin/admin

Base Model Patterns
python# All new domain models
class MyModel(OwnedModel):
    # Gets: created_at, updated_at (auto), created_by, updated_by (FK to User)
    name = models.CharField(max_length=160, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self):
        return self.name


# All new views
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
