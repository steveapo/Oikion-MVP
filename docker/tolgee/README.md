Self-hosted Tolgee (Docker Compose)

Prereqs
- Docker + Docker Compose
- Set required env vars (see below)

Quick start

```bash
# 1) Create an .env file with the variables below
cp .env.tolgee.example .env.tolgee

# 2) Start services
TOLGEE_DB_USERNAME=tolgee TOLGEE_DB_PASSWORD=tolgee \
  docker compose --env-file .env.tolgee -f docker/tolgee/docker-compose.yml up -d

# 3) Access Tolgee UI
open http://localhost:8085
```

Environment variables
- TOLGEE_DB_URL (e.g., jdbc:postgresql://postgres:5432/tolgee)
- TOLGEE_DB_USERNAME
- TOLGEE_DB_PASSWORD
- TOLGEE_ADMIN_EMAIL (optional)
- TOLGEE_ADMIN_PASSWORD (optional)
- TOLGEE_FORCE_SSL (optional; defaults true)

After startup
1. Create organization and project
2. Add languages: en (base), el
3. Generate API keys: read-only and write
4. Put values in your app/.env and CI

See docs at docs/tolgee-integration/index.md


