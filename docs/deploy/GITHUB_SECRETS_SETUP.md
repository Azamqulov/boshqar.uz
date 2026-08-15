# ════════════════════════════════════════════════════
#  boshqar.uz — GitHub Actions Secrets
#  GitHub → Settings → Secrets and variables → Actions
# ════════════════════════════════════════════════════

## GitHub'da qo'shilishi kerak bo'lgan Secrets:

### Database
DATABASE_URL       = postgresql://user:pass@host/db?sslmode=require

### JWT  
JWT_SECRET         = (kamida 64 ta belgi, random)

### Sentry
VITE_SENTRY_DSN    = https://xxx@sentry.io/project  (Frontend)
SENTRY_DSN         = https://xxx@sentry.io/project  (Backend)

### Docker Hub
DOCKER_USERNAME    = docker hub username
DOCKER_PASSWORD    = docker hub password yoki access token

### Production Server SSH
DEPLOY_HOST        = server IP yoki domain (masalan: 185.123.45.67)
DEPLOY_USER        = ubuntu yoki root
DEPLOY_SSH_KEY     = server private SSH kaliti (-----BEGIN...)
DEPLOY_PORT        = 22 (standart)

### Frontend API URL
VITE_API_URL       = https://boshqar.uz/api/v1

## GitHub Repository Settings:
# Settings → Environments → New environment → "production"
# bu environment'ga protection rules qo'shishingiz mumkin
# (masalan: deploy faqat main branch'dan bo'lsin)
