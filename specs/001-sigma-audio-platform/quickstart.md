# Quickstart Validation: Sigma Audio CRM

## 1. Backend setup

```bash
cd backend
python manage.py check
python manage.py makemigrations --check
python manage.py test
python manage.py runserver
```

## 2. Frontend setup

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

## 3. Core smoke scenarios

1. Log in via `/api/token/` and confirm cookies are set.
2. Call `/api/auth/me/` and verify authenticated profile.
3. As sales-executive:
   - `/api/v1/users/` -> 403
   - `/api/v1/audit-logs/` -> 403
   - `/api/v1/leads/` -> 200 with owned leads only
4. As admin:
   - `/api/v1/users/` -> 200
   - `/api/v1/audit-logs/` -> 200
   - `/api/v1/analytics/overview/` -> 200
5. Upload a file via `/api/v1/files/` for a lead and verify retrieval through filtered listing.

## 4. Regression checks

1. CSV import handles duplicates and invalid choice values with row-level reporting.
2. Lead move and notes endpoints remain available and contract-compatible.
3. Analytics overview cache serves warm reads during TTL window.
