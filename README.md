# Bayrat SaaS API

TypeScript, Express, PostgreSQL, Knex, JWT ve Zod kullanan katmanlı backend başlangıç projesi.

Detaylı endpoint örnekleri için [API dokümantasyonu](server/docs/API.md) dosyasına bakın.

## Başlangıç

```bash
cd server
cp .env.example .env
# Önce PostgreSQL'de bayrat veritabanını oluşturun ve DATABASE_URL'i düzenleyin.
npm run db:migrate
npm run dev
```

## Migration kullanımı

```bash
# Yeni migration oluştur
npm run db:migrate:make -- create_products

# Bekleyen migration'ları çalıştır
npm run db:migrate

# Son migration grubunu geri al
npm run db:rollback

# Migration durumunu görüntüle
npm run db:status
```

## Endpoint'ler

- `GET /health`
- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `POST /api/auth/refresh` — HttpOnly cookie kullanır
- `POST /api/auth/logout` — HttpOnly cookie kullanır
- `POST /api/auth/verify-email` — `{ "token" }`
- `POST /api/auth/resend-verification` — `{ "email" }`
- `POST /api/auth/forgot-password` — `{ "email" }`
- `POST /api/auth/reset-password` — `{ "token", "newPassword" }`
- `GET /api/users/me` — HttpOnly access cookie gerekir
- `PATCH /api/users/me` — `{ "name" }`, access cookie gerekir
- `PATCH /api/users/me/password` — `{ "currentPassword", "newPassword" }`, access cookie gerekir
- `POST /api/users/me/email-change` — `{ "currentPassword", "newEmail" }`, access cookie gerekir
- `DELETE /api/users/me` — `{ "currentPassword" }`, access cookie gerekir
- `GET /api/subscriptions/plans` — aktif üyelik planlarını listeler
- `GET /api/subscriptions/me` — kullanıcının mevcut üyeliğini getirir

Akış: route → validation/auth middleware → controller → service → repository → PostgreSQL.
