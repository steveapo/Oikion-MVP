Tolgee TMS-only Integration (Self-hosted)

Versions
- Next.js 14.2.5, next-intl 3.19.0
- Tolgee platform 3.136.1

Directory structure
- messages/en/*.json (source) → push to Tolgee
- messages/el/*.json (targets) ← pull from Tolgee
- scripts/tolgee/*.mjs (push/pull helpers)

Environment
- TOLGEE_API_URL
- TOLGEE_PROJECT_ID
- TOLGEE_API_KEY_READ
- TOLGEE_API_KEY_WRITE (maintainers/CI only)

Workflow
1) Add/modify English keys in messages/en
2) pnpm tolgee:push (maintainer) to sync to Tolgee
3) Translators work in Tolgee (reviewed state)
4) CI/build runs pnpm tolgee:pull then pnpm validate:i18n

Tolgee settings (recommended)
- Project → Settings → Export: include only Reviewed translations
- Languages: set English as base; disable MT overwrite of English
- API keys: create Read-only key for CI; Write key for maintainers

CI
- Run tolgee:pull only when secrets are present; always run validate:i18n

Rollback
- Skip tolgee:pull to freeze; re-run after fixes
- Revert messages/* if a bad import lands, then pull again

References
- Tolgee repo: https://github.com/tolgee/tolgee-platform
- Tolgee docs: https://docs.tolgee.io

## Tolgee TMS-only (Self-hosted) Integration

This document implements the approved plan to adopt Tolgee as a self-hosted Translation Management System (TMS) while keeping next-intl as the runtime i18n layer. No runtime behavior changes are introduced; the app continues to load local JSON messages and use middleware-based routing.

### Versions
- Next.js: 14.2.x (App Router)
- next-intl: 3.19.x
- Tolgee Server: v3.136.1 (or latest stable)

### Directories and files
- Runtime messages: `messages/{en,el}/*.json`
- Next-intl request config: `i18n/request.ts`
- Middleware routing: `middleware.ts`
- Validation: `scripts/validate-translations.mjs` (already present)
- Tolgee sync scripts: `scripts/tolgee/{push.ts,pull.ts,common.ts}`
- CI workflow: `.github/workflows/tolgee-sync.yml`
- Self-host compose: `docker/tolgee/docker-compose.yml`

### Environment variables
Create environment variables (in CI or local) for Tolgee access:

```
TOLGEE_API_URL=https://your-tolgee.example.com
TOLGEE_API_KEY_READ=xxxxx             # read-only key used to pull
TOLGEE_API_KEY_WRITE=xxxxx            # write-enabled key used to push
TOLGEE_PROJECT_ID=123                 # numeric ID of the Tolgee project
```

None of these are required at runtime. The app does not call Tolgee; these are only used by tooling/CI.

### Self-host Tolgee
We provide a minimal Docker Compose to run Tolgee with Postgres locally or in your infra:
- File: `docker/tolgee/docker-compose.yml`
- Configure `POSTGRES_*`, `TOLGEE_AUTH_*` and `TOLGEE_INTERNAL_*` as needed (see inline comments).

### Initial migration (one-time)
1) Seed Tolgee with current JSON files
- Option A (UI): Import `messages/en/*.json` (as base "en") and `messages/el/*.json` into your Tolgee project namespaces.
- Option B (script preparation):
  - pnpm tolgee:prepare:upload
  - Upload the generated `.tolgee/upload/en.merge.json` and `.tolgee/upload/el.merge.json` via Tolgee UI Import.

2) Reconcile conflicts in Tolgee UI
- Approve overwrites, lock critical keys if desired, set review states.

### Continuous sync
We keep JSON in-repo as the build source of truth and automate push/pull with pnpm scripts.

Scripts (via package.json):
- `pnpm tolgee:push` → Push English base keys to Tolgee (requires WRITE key)
- `pnpm tolgee:pull` → Pull all locales from Tolgee and write to `messages/` (requires READ key)
- `pnpm tolgee:prepare:upload` → Produce upload-ready merge JSONs from local messages for manual UI import (fallback)
- `pnpm validate:i18n` → Validate completeness across locales (already integrated into `build`)

CI (GitHub Actions):
- Workflow `.github/workflows/tolgee-sync.yml` pulls translations on changes to main and by manual dispatch; commits changes back with the GitHub token.
- Configure repository secrets: `TOLGEE_API_URL`, `TOLGEE_API_KEY_READ`, `TOLGEE_PROJECT_ID` (and optionally `TOLGEE_API_KEY_WRITE` if enabling push).

### Quality gates and safety
- The app never depends on Tolgee at runtime. It only reads local JSON.
- `scripts/validate-translations.mjs` ensures missing keys are caught in CI; English is the base.
- Fallbacks: next-intl continues to default to `en` if other locales are incomplete.

### Usage
Local (manual):
1. Pull latest translations (if configured):
   - `pnpm tolgee:pull`
2. Build normally:
   - `pnpm build`

Manual upload/export fallback:
1. Prepare upload files: `pnpm tolgee:prepare:upload`
2. In Tolgee UI → Import, upload `.tolgee/upload/en.merge.json` (base) and `.tolgee/upload/el.merge.json`.
3. Export from Tolgee UI to a JSON file per locale, place under `.tolgee/export/`, then run:
   - `pnpm tolgee:prepare:apply` (splits export into `messages/{locale}/*.json`)

### Notes
- You can extend CI to push English source from main merges using `pnpm tolgee:push`.
- The sync scripts are defensive: if env is missing, they fall back to local prep/import mode.

### References
- Tolgee platform: https://github.com/tolgee/tolgee-platform
- Tolgee docs: https://docs.tolgee.io


