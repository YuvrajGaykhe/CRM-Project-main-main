# Research: Sigma Audio Dealer & Sales Intelligence Platform

## Decision 1: Keep existing Django + React architecture
- **Decision**: Extend the current backend apps and frontend modules instead of redesigning structure.
- **Rationale**: Existing modules already map to required business domains and reduce migration risk.
- **Alternatives considered**: Full rewrite into new bounded contexts was rejected due to high disruption.

## Decision 2: Enforce cookie-based JWT transport
- **Decision**: Keep JWT only in httpOnly cookies with refresh/logout endpoints.
- **Rationale**: Prevents token exposure in browser storage and aligns with security baseline.
- **Alternatives considered**: Bearer token in localStorage rejected for XSS risk.

## Decision 3: Cache analytics overview for 300s
- **Decision**: Maintain a 5-minute cache for expensive analytics aggregation endpoint.
- **Rationale**: Preserves responsiveness while reducing repeated DB load.
- **Alternatives considered**: Fully uncached read path rejected due to query pressure.

## Decision 4: Mandatory write hooks
- **Decision**: Every write operation uses audit + lead timeline/notification hooks where applicable.
- **Rationale**: Guarantees traceability and event completeness.
- **Alternatives considered**: Selective logging rejected because it creates blind spots.

## Decision 5: Scoped querysets and eager loading
- **Decision**: Role filtering in `get_queryset()` and relation loading via `select_related`/`prefetch_related`.
- **Rationale**: Prevents data leakage and N+1 query growth.
- **Alternatives considered**: Inline filtering in `list()` rejected for maintainability and RBAC drift.
