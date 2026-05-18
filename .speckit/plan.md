## Shell command rules

- Always use `python3` — never `python`.
- `.env` is never committed.
- Verify `.env` has not been committed with:
  `git log --all --full-history -- "backend/.env"`.
