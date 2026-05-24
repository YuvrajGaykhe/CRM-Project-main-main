# Sigma Audio CRM → Premium Operational Intelligence Platform

Transform the existing CRM into a command-center-grade platform that competes with Twenty CRM, HubSpot, and Salesforce.

## Codebase Analysis Summary

**What already works well:**
- Full CRUD API for all entities (leads, dealers, products, tasks, followups, notifications, audit)
- CookieJWT auth with httpOnly cookies, RBAC permissions, role-scoped querysets
- React Query data layer with optimistic updates on lead moves
- Sidebar navigation with role-based filtering via `ROLE_ACCESS` constants
- Global search in header bar
- Lead workspace with list/kanban views, detail drawer, follow-ups, notes, timeline
- Analytics endpoint with 5-min caching
- Framer Motion drawer animation on LeadDetailDrawer

**What needs transformation (frontend-only — NO backend changes):**
- Design system needs formalization (scattered primitives → unified component library)
- Font must change from Space Grotesk → Inter
- Font-weight 600 (`font-semibold`) used everywhere → must change to 500 (`font-medium`) per anti-pattern registry
- Sidebar needs collapsible mode, user profile section at bottom
- Command palette (⌘K) doesn't exist yet
- Data tables use manual HTML tables → need SigmaDataTable wrapping @tanstack/react-table
- No skeleton loading on most pages (text-only "Loading..." fallbacks)
- No bulk actions on any table
- Dealer detail is a modal → needs slide-over drawer
- Analytics dashboard needs dark-themed chart polish
- Notifications lack "mark all read" UI button and type filtering
- Audit log needs better UX

> [!IMPORTANT]
> **This is a frontend-only transformation.** No backend models, views, serializers, or migrations need to change. All existing API endpoints are sufficient.

## User Review Required

> [!WARNING]
> **Font-weight constraint:** The anti-pattern registry mandates `font-weight 400/500 only — never 600 or 700`. The current codebase uses `font-semibold` (600) in ~200+ places. I will systematically replace all `font-semibold` with `font-medium` (500) across every touched file. This is a visual change — text will appear slightly lighter. Please confirm this is desired.

> [!IMPORTANT]
> **Font change:** Current font is Space Grotesk. The spec requests Inter. I will update the Google Fonts import and body font-family. This changes the visual feel of the entire app.

## Open Questions

1. **Sidebar SLA widget**: The current sidebar has a hardcoded "Dealer Inquiry SLA" widget showing "91%". Should this be kept, removed, or made dynamic?
2. **Legacy components**: Files like `AddContact.jsx`, `EditContact.jsx`, `ContactsPage.jsx`, `AddRecord.jsx`, `ReadRecord.jsx`, `EditRecord.jsx`, `TasksPage.jsx`, `ChatPage.jsx` appear to be legacy pre-CRM components. Should they be removed or left untouched?
3. **Route structure**: Currently all dashboard routes are under `/dashboard/...`. The spec shows `/leads`, `/dealers`, etc. (without `/dashboard` prefix). Should I keep the existing `/dashboard/leads` structure or flatten to `/leads`?

---

## Proposed Changes

### PHASE 1: Design System Foundation

Build the shared component library that every subsequent phase depends on.

---

#### [MODIFY] [index.css](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/index.css)
- Replace Space Grotesk with Inter font import
- Update design tokens to match spec:
  - `--sigma-bg: #0f0f10`, `--sigma-surface: #1a1a1c`, `--sigma-border: #2a2a2e`
  - `--sigma-text-primary: #f0f0f0`, `--sigma-text-muted: #8a8a9a`
  - `--sigma-accent: #6366f1`, `--sigma-success: #22c55e`, `--sigma-warning: #f59e0b`, `--sigma-danger: #ef4444`
- Add motion tokens as CSS custom properties
- Keep existing animation keyframes

#### [MODIFY] [tailwind.config.js](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/tailwind.config.js)
- Extend theme with sigma color tokens, spacing scale (4px base), and font family (Inter)

#### [NEW] `src/components/ui/SigmaButton.jsx`
- Variants: `primary` (indigo accent), `secondary` (border + ghost bg), `ghost` (transparent), `danger` (red)
- Sizes: `sm`, `md`, `lg`
- Loading state with spinner
- Replaces `ActionButton` usage pattern (but keeps ActionButton for backward compat)

#### [NEW] `src/components/ui/SigmaBadge.jsx`
- Extends existing `StatusBadge` pattern
- Maps all Lead, Dealer, Task, FollowUp statuses to colors
- Supports `dot` variant (just a colored circle) for priority indicators

#### [NEW] `src/components/ui/SigmaAvatar.jsx`
- Initials fallback from name
- Size variants: `xs` (24px), `sm` (32px), `md` (40px), `lg` (48px)
- Gradient background based on name hash

#### [NEW] `src/components/ui/SigmaTooltip.jsx`
- Lightweight hover tooltip using CSS + a portal
- Positions: top, bottom, left, right
- No external dependency

#### [NEW] `src/components/ui/SigmaDropdown.jsx`
- Trigger + menu panel with framer-motion fade
- Items with icons, dividers, danger items
- Click-outside to close
- Keyboard navigation (arrow keys + Enter)

#### [NEW] `src/components/ui/SigmaSkeleton.jsx`
- Extends existing `Skeleton` from uiPrimitives
- Variants: `text`, `circle`, `card`, `row`, `table` (multiple rows)
- Pulse animation

#### [NEW] `src/components/ui/SigmaDrawer.jsx`
- Slides from right, 480px on desktop, full-width on mobile
- Backdrop blur + dark overlay
- Close on Escape + backdrop click
- Framer-motion animated open/close (250ms ease-out)
- Stacking support via z-index management
- Replaces the inline AnimatePresence pattern in LeadDetailDrawer

#### [NEW] `src/components/ui/SigmaCommandPalette.jsx`
- Opens on ⌘K (Mac) / Ctrl+K (Windows)
- Search input with debounce (300ms)
- Calls existing `globalSearch()` API
- Shows results grouped by type (leads, dealers, products, tasks)
- Action shortcuts section: "Create lead", "New task", "Open settings"
- Recent records (stored in localStorage)
- Closes on Escape and on selection
- Framer-motion fade+scale animation

#### [NEW] `src/components/ui/SigmaDataTable.jsx`
- Wraps `@tanstack/react-table` with sigma styling
- Column visibility toggle dropdown
- Multi-column sort indicators
- Row selection with checkboxes
- Bulk action toolbar (appears when rows selected)
- Pagination controls (page size selector + prev/next)
- Density toggle: compact (py-2) / comfortable (py-3) / spacious (py-4)
- Loading state → SigmaSkeleton table rows
- Empty state → SigmaEmptyState
- Export button prop

#### [NEW] `src/components/ui/SigmaKanbanBoard.jsx`
- Wraps existing drag-drop pattern with premium UX
- Column headers with status name + count badge
- Cards with: name, mobile, source badge, priority dot, avatar, days-in-status
- Drag: scale 1.02 + shadow while dragging
- Drop handler calls parent callback
- Empty column: dashed border drop target

#### [NEW] `src/components/ui/SigmaTimeline.jsx`
- Vertical timeline with icons per action type
- Each event: icon + description + timestamp + user avatar
- Newest first
- Color-coded by event type

#### [NEW] `src/components/ui/SigmaPageHeader.jsx`
- Left: Breadcrumb (uses existing Breadcrumb component)
- Center: Page title + subtitle
- Right: Action buttons slot (primary + secondary)
- Consistent pattern used on every page

#### [NEW] `src/components/ui/SigmaStatCard.jsx`
- KPI value with label
- Trend indicator (up/down arrow + percentage)
- Icon with gradient background
- Count-up animation on first render using requestAnimationFrame

#### [MODIFY] [EmptyState.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/components/ui/EmptyState.jsx)
- Add `icon` prop (contextual icon per module)
- Add `subtitle` prop
- Add `actionLabel` + `onAction` props for primary button
- Keep backward compatible

#### [NEW] `src/components/ui/SigmaFilterBar.jsx`
- Horizontal bar with filter chips
- Each filter: label + select dropdown
- Sort control with direction toggle
- Search input with debounce
- "Clear all" button
- Active filter count badge

#### [NEW] `src/components/ui/SigmaErrorCard.jsx`
- Error icon + "Something went wrong" message
- Retry button
- Used by every useQuery error state

---

### PHASE 2: Layout and Navigation

#### [MODIFY] [DashboardShell.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/layouts/DashboardShell.jsx)
Major refactor:
- **Collapsible sidebar**: 240px expanded → 56px collapsed (icon-only)
- Collapse toggle button + keyboard shortcut (⌘/)
- Smooth width transition (250ms ease-out)
- Logo: Sigma Audio wordmark (expanded) / "SA" icon (collapsed)
- Navigation items using MODULES + ROLE_ACCESS (already exists, refine styling)
- Notification badge on Notifications item (already exists)
- User avatar + name + role at bottom (above logout)
- Remove hardcoded SLA widget (or keep if user wants)
- Move global search to command palette trigger (⌘K hint button)
- **Remove header bar** — fold user info + search into sidebar
- Content area: full remaining width, SigmaPageHeader at top of each module

#### [MODIFY] [uiStore.js](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/app/store/uiStore.js)
- Add `sidebarCollapsed` state + toggle
- Persist collapse preference

#### [MODIFY] [Dashboard.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/components/Dashboard.jsx)
- Replace current layout with:
  - Top row: 4 SigmaStatCards (Total Leads, Leads Today, Active Dealers, Overdue Follow-ups)
  - Second row: Pipeline funnel + Follow-up efficiency + Top products
  - Third row: Activity timeline + Navigation cards (role-filtered)
- Use SigmaPageHeader
- Use SigmaSkeleton while loading
- staleTime: 300_000 on analytics query (already set)

#### [MODIFY] [Breadcrumb.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/components/Breadcrumb.jsx)
- Integrate into SigmaPageHeader pattern (keep as standalone but add to header)

---

### PHASE 3: Lead Command Center

#### [MODIFY] [LeadsWorkspace.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/leads/components/LeadsWorkspace.jsx)
- Replace filter Card with SigmaFilterBar
- Replace view toggle Links with SigmaPageHeader pattern
- Add bulk action support (when rows selected): reassign, change status, export, delete
- Use SigmaDataTable for list mode
- Use SigmaKanbanBoard for kanban mode
- Quick row actions on hover: view drawer, edit status, schedule follow-up, assign

#### [MODIFY] [LeadsTable.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/leads/components/LeadsTable.jsx)
- Replace with SigmaDataTable usage
- Add row selection checkboxes
- Add inline hover actions column

#### [MODIFY] [LeadDetailDrawer.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/leads/components/LeadDetailDrawer.jsx)
- Use SigmaDrawer as base (replace inline AnimatePresence)
- Reorganize into 8 clear sections as specified:
  1. Lead Header (name, status badge, source, priority, date, executive)
  2. Quick Actions Bar (schedule, add note, upload, reassign, move status, export)
  3. Contact Details (mobile click-to-copy, WhatsApp link, email, address — inline editable)
  4. Activity Timeline (SigmaTimeline component)
  5. Follow-ups (list with status badges, inline mark complete)
  6. Notes (textarea + submit, list newest first)
  7. Attachments (file list + upload)
  8. Related Tasks (task list + add task)

#### [MODIFY] [LeadsKanbanBoard.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/leads/components/LeadsKanbanBoard.jsx)
- Use SigmaKanbanBoard wrapper
- Enhanced card design: name, mobile, source badge, priority dot, executive avatar, days in status
- Optimistic drag-drop (already implemented, enhance animation)

#### [NEW] `src/modules/leads/hooks/useLeads.js`
- `useLeads(filters)` — wraps leadsApi with useQuery
#### [NEW] `src/modules/leads/hooks/useLead.js`
- `useLead(id)` — single lead with relations
#### [NEW] `src/modules/leads/hooks/useLeadMutation.js`
- create/update/delete mutations
#### [NEW] `src/modules/leads/hooks/useLeadMove.js`
- Move status with optimistic update
#### [NEW] `src/modules/leads/hooks/useLeadNotes.js`
- Notes list + add note
#### [NEW] `src/modules/leads/hooks/useLeadTimeline.js`
- Timeline events (staleTime: 15_000)
#### [NEW] `src/modules/leads/hooks/useLeadFollowUps.js`
- Follow-ups for a lead
#### [NEW] `src/modules/leads/hooks/useLeadAttachments.js`
- Files for a lead

---

### PHASE 4: Dealer Intelligence Center

#### [MODIFY] [DealersPage.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/dealers/DealersPage.jsx)
- Replace card grid with SigmaDataTable (columns: name, tier, status, territory manager, region, city, active leads, revenue, last activity)
- Add SigmaFilterBar (status, tier, type, region, state)
- Add bulk actions: change status, assign territory manager
- Add view toggle: table / cards
- Use SigmaPageHeader

#### [NEW] `src/modules/dealers/components/DealerDetailDrawer.jsx`
- Use SigmaDrawer
- Sections: header, contact info, territory, performance metrics, assigned leads, activity timeline, notes, attachments

#### [NEW] `src/modules/dealers/hooks/useDealers.js`
#### [NEW] `src/modules/dealers/hooks/useDealer.js`
#### [NEW] `src/modules/dealers/hooks/useDealerMutation.js`

---

### PHASE 5: Analytics Command Dashboard

#### [MODIFY] [AnalyticsDashboard.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/components/AnalyticsDashboard.jsx)
- Use SigmaPageHeader
- Row 1: 6 SigmaStatCards (Total Leads, Leads Today, Conversion Rate, Active Dealers, Open Tasks, Follow-up Efficiency)
- Row 2: Lead funnel (horizontal bar), Conversion trend (line), Lead sources (donut)
- Row 3: State-wise distribution (bar), Top 10 dealer ranking (sortable table), Product demand (bar)
- Row 4: Overdue follow-ups (clickable list), Recent audit trail, Executive performance table
- All charts: dark-themed, ResponsiveContainer, tooltips
- SigmaSkeleton while loading
- staleTime: 300_000

---

### PHASE 6: Tasks and Follow-up System

#### [MODIFY] [SigmaTasksPage.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/tasks/SigmaTasksPage.jsx)
- Replace task list with SigmaDataTable (columns: title, type, priority, status, assigned to, due date, related lead)
- SigmaFilterBar: status, priority, type, assignee, due date range
- Bulk actions: mark complete, reassign, delete
- Row action: quick complete, view detail, edit
- Follow-ups tab with its own SigmaDataTable
- Use SigmaPageHeader

---

### PHASE 7: Notifications Center

#### [MODIFY] [NotificationsPage.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/notifications/NotificationsPage.jsx)
- Notification feed with rich cards (icon by type + title + message + time)
- "Mark all read" button (calls existing `markAllNotificationsRead()`)
- Filter: all / unread / by type
- Click notification → navigate to relevant record
- Unread count badge in sidebar (already exists, ensure staleTime: 30_000)
- Use SigmaPageHeader

---

### PHASE 8: Audit Log Page

#### [MODIFY] [AuditLogPage.jsx](file:///Users/yuvrajgaykhe/Downloads/CRM-Project-main-main/frontend/src/modules/audit/AuditLogPage.jsx)
- Replace manual table with SigmaDataTable (columns: timestamp, user avatar+name, action, entity type, entity ID, IP address)
- SigmaFilterBar: date range, user, action type, entity type
- Read-only, no mutations
- Use SigmaPageHeader

---

### PHASE 9: UX Polish

#### Loading states
- Every useQuery → SigmaSkeleton (no spinner-only or text-only loading)
- Drawer content: skeleton sections while fetching

#### Optimistic updates
- Lead status move: already implemented ✓
- Mark notification read: add optimistic update
- Task mark complete: add optimistic update
- Toast on success/error via SweetAlert2 (already installed)

#### Framer Motion animations
- SigmaDrawer: slide-in right (250ms ease-out) ✓ (built into component)
- SigmaCommandPalette: fade + scale (150ms ease-out)
- Kanban drag: scale 1.02 + shadow
- Page transition: subtle fade (150ms)
- Sidebar collapse: smooth width (250ms)
- Stat cards: count-up animation

#### Keyboard navigation
- ⌘K / Ctrl+K → command palette
- Escape → close drawer/modal
- ⌘/ / Ctrl+/ → toggle sidebar

#### Empty states
- Every zero-results → SigmaEmptyState with icon, title, subtitle, action button

#### Error states
- Every useQuery error → SigmaErrorCard with retry button

#### Font-weight audit
- Replace all `font-semibold` → `font-medium` across all modified files
- Replace all `font-bold` → `font-medium` across all modified files

---

## Verification Plan

### After Each Phase

**Frontend checks:**
```bash
cd frontend && npm run lint    # must be 0 errors
cd frontend && npm run build   # must be clean build
```

**Manual verification:**
- Navigate to each page, verify rendering
- Test role-based nav visibility
- Test drawer open/close
- Test command palette
- Test data table sorting, filtering, pagination
- Test kanban drag-drop

### RBAC Verification (no backend changes, but verify frontend hides correctly)
- Login as sales-executive → Audit Log and Users nav items must be hidden
- Login as admin → All nav items visible

### Performance Verification
- Analytics page loads with cached data (staleTime: 300_000)
- Lead list loads without N+1 (backend already optimized)
- Drawer content shows skeleton while loading

---

## Execution Order

| Phase | Dependency | Est. Files |
|-------|-----------|------------|
| 1. Design System | None | ~18 new + 3 modified |
| 2. Layout & Nav | Phase 1 | ~4 modified |
| 3. Lead Center | Phase 1, 2 | ~12 modified/new |
| 4. Dealer Center | Phase 1, 2 | ~5 modified/new |
| 5. Analytics | Phase 1, 2 | ~1 modified |
| 6. Tasks | Phase 1, 2 | ~1 modified |
| 7. Notifications | Phase 1, 2 | ~1 modified |
| 8. Audit Log | Phase 1, 2 | ~1 modified |
| 9. UX Polish | All phases | Touch all files |

**Total: ~45 files created or modified, 0 backend changes, 0 migrations.**
