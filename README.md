# Bayrat SaaS API

TypeScript, Express, PostgreSQL, Knex, JWT ve Zod kullanan katmanlı backend başlangıç projesi.

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
- `GET /api/users/me` — `Authorization: Bearer <token>` gerekir

Akış: route → validation/auth middleware → controller → service → repository → PostgreSQL.
