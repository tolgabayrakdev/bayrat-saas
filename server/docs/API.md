# API Dokümantasyonu

Sunucu adresi:

```text
http://localhost:3000
```

JSON body gönderilen isteklerde:

```http
Content-Type: application/json
```

## Health

### GET /health

API'nin çalışıp çalışmadığını kontrol eder. `/api` prefix'i kullanılmaz.

```http
GET /health
```

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Auth

### POST /api/auth/register

Yeni hesap oluşturur ve doğrulama e-postası gönderir.

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Tolga",
  "email": "tolga@example.com",
  "password": "guvenliParola123"
}
```

```json
{
  "success": true,
  "message": "Hesabınız başarıyla oluşturuldu"
}
```

### POST /api/auth/verify-email

E-postayla gönderilen token ile hesabı veya yeni e-posta adresini doğrular.

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "epostayla-gelen-token"
}
```

```json
{
  "success": true,
  "message": "E-posta adresiniz başarıyla doğrulandı"
}
```

### POST /api/auth/resend-verification

Doğrulama e-postasını tekrar gönderir. Güvenlik nedeniyle e-posta kayıtlı olmasa da aynı cevap döner.

```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "tolga@example.com"
}
```

### POST /api/auth/login

Doğrulanmış hesapla giriş yapar. Access ve refresh token'ları HttpOnly cookie olarak ayarlar.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tolga@example.com",
  "password": "guvenliParola123"
}
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Tolga",
      "email": "tolga@example.com",
      "email_verified_at": "2026-09-03T12:00:00.000Z",
      "created_at": "2026-09-03T11:55:00.000Z"
    }
  }
}
```

### POST /api/auth/refresh

HttpOnly refresh cookie ile oturumu yeniler. Yeni access ve refresh cookie ayarlanır; eski refresh token tekrar kullanılamaz.

```http
POST /api/auth/refresh
Content-Type: application/json

Body gerekmez.
```

```json
{
  "success": true,
  "message": "Oturum yenilendi"
}
```

### POST /api/auth/logout

HttpOnly refresh cookie'ye bağlı oturumu kapatır ve auth cookie'lerini temizler.

```http
POST /api/auth/logout
Content-Type: application/json

Body gerekmez.
```

```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı"
}
```

### POST /api/auth/forgot-password

Parola sıfırlama e-postası ister. Güvenlik nedeniyle e-posta kayıtlı olmasa da aynı cevap döner.

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "tolga@example.com"
}
```

```json
{
  "success": true,
  "message": "E-posta kayıtlıysa parola sıfırlama bağlantısı gönderildi"
}
```

### POST /api/auth/reset-password

E-postayla gönderilen tek kullanımlık token ile parolayı sıfırlar.

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "epostayla-gelen-token",
  "newPassword": "yeniGuvenliParola123"
}
```

```json
{
  "success": true,
  "message": "Parolanız başarıyla sıfırlandı"
}
```

## Kullanıcı ve ayarlar

Bu bölümdeki bütün endpoint'ler HttpOnly access cookie gerektirir. Cookie tarayıcı tarafından otomatik gönderilir.

```http
Cookie: access_token=<HttpOnly>
```

### GET /api/users/me

Giriş yapan kullanıcının profilini getirir.

```http
GET /api/users/me
Cookie: access_token=<HttpOnly>
```

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tolga",
    "email": "tolga@example.com",
    "email_verified_at": "2026-09-03T12:00:00.000Z",
    "created_at": "2026-09-03T11:55:00.000Z"
  }
}
```

### PATCH /api/users/me

Giriş yapan kullanıcının adını günceller.

```http
PATCH /api/users/me
Cookie: access_token=<HttpOnly>
Content-Type: application/json

{
  "name": "Yeni isim"
}
```

### PATCH /api/users/me/password

Giriş yapan kullanıcının parolasını değiştirir ve bütün oturumlarını kapatır.

```http
PATCH /api/users/me/password
Cookie: access_token=<HttpOnly>
Content-Type: application/json

{
  "currentPassword": "mevcutParola",
  "newPassword": "yeniGuvenliParola123"
}
```

```json
{
  "success": true,
  "message": "Parolanız başarıyla güncellendi"
}
```

### POST /api/users/me/email-change

Yeni e-posta adresine doğrulama bağlantısı gönderir. E-posta, bağlantı onaylandıktan sonra değiştirilir.

```http
POST /api/users/me/email-change
Cookie: access_token=<HttpOnly>
Content-Type: application/json

{
  "currentPassword": "mevcutParola",
  "newEmail": "yeni@example.com"
}
```

```json
{
  "success": true,
  "message": "Yeni e-posta adresinize doğrulama bağlantısı gönderildi"
}
```

### DELETE /api/users/me

Giriş yapan kullanıcının hesabını kalıcı olarak siler.

```http
DELETE /api/users/me
Cookie: access_token=<HttpOnly>
Content-Type: application/json

{
  "currentPassword": "mevcutParola"
}
```

```json
{
  "success": true,
  "message": "Hesabınız başarıyla silindi"
}
```

## Hata formatı

Hatalar ortak formatta döner:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "Mevcut parola hatalı"
  }
}
```

Yaygın HTTP durum kodları:

- `400` — Validasyon veya geçersiz token
- `401` — Giriş gerekli veya parola hatalı
- `403` — E-posta doğrulanmamış
- `404` — Kayıt bulunamadı
- `409` — E-posta zaten kullanımda
- `429` — Çok fazla istek
- `500` — Beklenmeyen sunucu hatası

## Plan ve abonelik

### GET /api/subscriptions/plans

Aktif Free ve Premium planları ve Premium dönem seçeneklerini listeler.

### GET /api/subscriptions/me

Kullanıcının mevcut aboneliğini getirir. HttpOnly access cookie gerekir.
Premium süresi dolmuşsa abonelik otomatik olarak Free plana geçirilir.

### POST /api/subscriptions/me/upgrade

Development demosunda ödeme almadan Premium aboneliği aktif eder. HttpOnly access cookie gerekir.

```json
{
  "billingPeriod": "monthly"
}
```

`billingPeriod`: `monthly`, `quarterly` veya `yearly` olabilir.

### POST /api/subscriptions/me/cancel

Development demosunda Premium aboneliği iptal edip hesabı Ücretsiz plana geçirir. HttpOnly access cookie gerekir.
