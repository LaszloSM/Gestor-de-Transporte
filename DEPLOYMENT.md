# 🚀 Deployment y Control de Versiones

## Git Setup

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit: Electoral Transport Manager"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Branches recomendadas
```
main                ← Producción
├── develop        ← Rama de desarrollo
│   ├── feature/*   ← Nuevas características
│   └── bugfix/*    ← Correcciones
└── hotfix/*        ← Parches urgentes
```

### Git Workflow
```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push a GitHub
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Después de aprobación:
git checkout develop
git pull origin develop
git merge feature/nueva-funcionalidad
git push origin develop

# Merge a main para release
git checkout main
git pull origin main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## Deployment a Vercel

### Opción 1: Vercel Dashboard

1. **Conectar repositorio**
   - Ir a https://vercel.com
   - Click "New Project"
   - Seleccionar repo de GitHub

2. **Configurar variables de entorno**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. **Si el proyecto de Supabase estaba pausado o lo acabas de reactivar**
   - Entra al [Dashboard de Supabase](https://supabase.com/dashboard) → tu proyecto → **Project Settings** → **API**.
   - Copia de nuevo **Project URL** y **anon public** (la clave pública).
   - En local: actualiza `.env.local` con esos valores, guarda, y **reinicia el servidor** (`npm run dev`). Vite solo lee las variables al arrancar.
   - Si la base se reinició, ejecuta de nuevo los SQL: `setup-database.sql` y `fix-auth.sql` en el SQL Editor de Supabase.

4. **Deploy**
   - Click "Deploy"
   - Vercel auto-construye y despliega

### Opción 2: Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Loguear
vercel login

# Deploy
vercel

# Production
vercel --prod
```

## Deployment a Netlify

### Con Netlify CLI
```bash
# Instalar
npm i -g netlify-cli

# Loguear
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Con Netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "functions"
  publish = "dist"

[build.environment]
  VITE_SUPABASE_URL = "your-url"
  VITE_SUPABASE_ANON_KEY = "your-key"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment a Railway

```bash
# 1. Crear cuenta en https://railway.app
# 2. Conectar GitHub
# 3. Crear nuevo proyecto
# 4. Seleccionar repo
# 5. Railway auto-detecta Next.js/React
# 6. Configurar variables de entorno
# 7. Deploy automático en cada push a main
```

## Deployment a AWS (S3 + CloudFront)

```bash
# Build
npm run build

# Instalar AWS CLI
pip install awscli

# Configurar credenciales
aws configure

# Crear bucket S3
aws s3 mb s3://electoral-transport

# Upload
aws s3 sync dist/ s3://electoral-transport

# Crear distribución CloudFront
# (Via AWS Console)

# Configurar DNS
# Apuntar tu dominio a CloudFront
```

## Deployment a Google Cloud Run

```bash
# Crear Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

# Build y push
gcloud builds submit --tag gcr.io/PROJECT-ID/electoral-transport

# Deploy
gcloud run deploy electoral-transport \
  --image gcr.io/PROJECT-ID/electoral-transport \
  --platform managed \
  --region us-central1 \
  --set-env-vars VITE_SUPABASE_URL=xxx,VITE_SUPABASE_ANON_KEY=xxx
```

## CI/CD con GitHub Actions

### Workflow: Build & Deploy

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Monitoreo y Logging

### Sentry para Error Tracking

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

### LogRocket para Session Replay

```javascript
import LogRocket from 'logrocket'

LogRocket.init(import.meta.env.VITE_LOGROCKET_ID)

LogRocket.getSessionURL(sessionURL => {
  console.log(`Session URL: ${sessionURL}`)
})
```

### Vercel Analytics

```javascript
// src/main.jsx
import { Analytics } from '@vercel/analytics/react'

<App />
<Analytics />
```

## Backups

### Backup Automático Supabase

```bash
# Verifica que Supabase tenga backups automáticos activados:
# Settings → Database → Backups

# Manual backup (PostgreSQL)
pg_dump -h db.supabase.co \
  -U postgres -d postgres \
  -F c -f backup.sql
```

### Backup a Google Drive

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y-%m-%d_%H:%M:%S)
BACKUP_FILE="backup_${DATE}.sql"

# Crear backup
pg_dump -h $DB_HOST -U postgres -d postgres > $BACKUP_FILE

# Upload a Google Drive
gdrive upload --parent $FOLDER_ID $BACKUP_FILE

# Limpiar backups viejos
find . -name "backup_*.sql" -mtime +7 -delete
```

## Performance Optimization

### Lighthouse Checklist

```
Performance:  > 90
Accessibility: > 90
Best Practices: > 90
SEO: > 90
```

### Bundle Analysis

```bash
# Instalar plugin
npm install --save-dev rollup-plugin-visualizer

# Analizar
npm run build
# Abre dist/stats.html
```

## Versioning

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.2.3

MAJOR: Cambios incompatibles (breaking)
MINOR: Nuevas features (backwards compatible)
PATCH: Bug fixes
```

### Release Process
```bash
# Bumping version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Tagging
git tag v1.0.0
git push origin v1.0.0

# Release en GitHub
gh release create v1.0.0 -t "Release 1.0.0" -n "Changes..."
```

## Health Checks

```javascript
// api/health.js (si tienes backend)
export default function handler(req, res) {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    database: checkDatabase(),
    supabase: checkSupabase(),
  }
  
  res.status(200).json(health)
}

// Monitoring
setInterval(async () => {
  const response = await fetch('/api/health')
  const health = await response.json()
  
  if (health.status !== 'UP') {
    sendAlert('Sistema no disponible')
  }
}, 60000) // Cada minuto
```

## Rollback Plan

### Si algo sale mal en producción:

```bash
# Ver commit anterior
git log --oneline

# Rollback a commit anterior
git revert <commit-hash>
git push origin main

# O revert a versión anterior
git reset --hard HEAD~1
git push -f origin main

# En Vercel/Netlify:
# Dashboard → Deployments → Redeploy previous
```

## Checklists de Deployment

### Pre-Production
- [ ] Código revisado
- [ ] Tests pasados
- [ ] Build sin errores
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL certificado
- [ ] DNS actualizado
- [ ] Backups listos

### Post-Production
- [ ] Verificar funcionalidad crítica
- [ ] Revisar logs de errores
- [ ] Monitorear performance
- [ ] Verificar analytics
- [ ] Comunicar al equipo
- [ ] Documentar cambios

## Disaster Recovery

### Plan de Recuperación

```
⚡ EMERGENCIA → 5 minutos
├─ Detectar problema
├─ Activar equipo
├─ Anunciar a usuarios
├─ Iniciar rollback
└─ Restaurar servicio

🔧 POST-INCIDENTE → 24 horas
├─ Análisis de causa raíz
├─ Crear ticket
├─ Desarrollo fix
├─ Deploy fix
└─ Retrospectiva
```

## Documentación Deployment

### README de Deployment

Agregar a README:
```markdown
## Deployment

### Variables de Entorno Requeridas
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### Deployment a [Platform]
Ver DEPLOYMENT.md

### Health Check
GET /api/health
```

---

**Nota**: Adaptar estos pasos según tu plataforma elegida. Los ejemplos incluyen Vercel, Netlify, AWS, GCP y GitHub Actions.
