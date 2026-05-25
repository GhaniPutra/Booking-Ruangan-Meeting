# Dokumentasi REST API — Meeting Room Booking

Dokumen ini menjelaskan endpoint API yang tersedia untuk digunakan oleh aplikasi mobile.

Base URL: http://{HOST}:{PORT}/api

Semua respons error mengikuti format JSON:

```json
{ "message": "Deskripsi error" }
```

Autentikasi
- Header: `Authorization: Bearer <token>` (JWT yang diterima dari login)

Format tanggal/waktu
- `date`: `YYYY-MM-DD` (contoh: `2026-05-25`)
- `start_time` / `end_time`: `HH:MM` 24-jam (contoh: `09:00`)

1) Auth
- POST `/api/auth/register`
  - Body JSON: `{ "name":string, "email":string, "password":string, "phone":string? }`
  - Responses: `201` success `{ message: 'Registrasi berhasil' }`, `400` validation

- POST `/api/auth/login`
  - Body JSON: `{ "email":string, "password":string }`
  - Responses: `200` success `{ token, user }` dimana `user` berisi `id, name, email, role, phone`; `401` invalid credentials

Contoh curl login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@booking.com","password":"admin123"}'
```

2) Rooms (ruangan)
- GET `/api/rooms` (authenticated)
  - Query: none
  - Response: `200` array of rooms `{ id, name, capacity, created_at, updated_at }`

- GET `/api/rooms/:id` (authenticated)
  - Response: `200` room object atau `404` jika tidak ditemukan

- POST `/api/rooms` (authenticated, role: admin)
  - Body JSON: `{ "name":string, "capacity":number }`
  - Response: `201` `{ message, id }` atau `400` jika validation

- PUT `/api/rooms/:id` (authenticated, role: admin)
  - Body JSON: `{ "name":string?, "capacity":number? }`
  - Response: `200` `{ message }` atau `404`

- DELETE `/api/rooms/:id` (authenticated, role: admin)
  - Response: `200` `{ message }` atau `404`

3) Bookings
- GET `/api/bookings` (authenticated)
  - Query params (optional): `room_id`, `date`, `user_id` (admin saja dapat menggunakan `user_id` untuk lihat user lain)
  - Behavior: jika role `customer`, hanya mengembalikan booking milik user tersebut
  - Response: `200` array booking objects

- GET `/api/bookings/:id` (authenticated)
  - Response: `200` booking object, `403` jika customer mengakses booking orang lain, `404` jika tidak ditemukan

- POST `/api/bookings` (authenticated)
  - Body JSON: `{ "room_id":number, "date":"YYYY-MM-DD", "start_time":"HH:MM", "end_time":"HH:MM", "user_id":number? }`
    - `user_id` hanya berlaku jika pengirim adalah `admin`. Untuk `customer`, user akan diambil dari token.
  - Validasi & kemungkinan respons:
    - `400` jika field kurang / `start_time >= end_time`
    - `404` jika room atau user tidak ditemukan
    - `409` conflict jika jadwal bentrok
    - `201` sukses `{ message: 'Booking berhasil dibuat', id }`

- PUT `/api/bookings/:id` (authenticated)
  - Body JSON: `{ "room_id", "date", "start_time", "end_time" }`
  - Hanya owner booking atau admin yang dapat mengubah
  - Validasi sama seperti create; `409` jika bentrok
  - Responses: `200` sukses, `403` unauthorized, `404` not found

- DELETE `/api/bookings/:id` (authenticated)
  - Hanya owner booking atau admin yang dapat menghapus
  - Responses: `200` sukses, `403` unauthorized, `404` not found

Contoh create booking (customer):

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"room_id":1,"date":"2026-05-28","start_time":"09:00","end_time":"10:00"}'
```

4) Users (admin-only)
- GET `/api/users` (authenticated, admin)
  - Response: `200` array users

- GET `/api/users/:id` (authenticated, admin)
  - Response: `200` user object

- POST `/api/users` (authenticated, admin)
  - Body JSON: `{ "name", "email", "password", "role"?, "phone"? }`
  - Response: `201` `{ message, id }`

- PUT `/api/users/:id` (authenticated, admin)
  - Body JSON: `{ "name"?, "email"?, "role"?, "phone"? }`
  - Response: `200` `{ message }`

- DELETE `/api/users/:id` (authenticated, admin)
  - Response: `200` `{ message }`

5) Profile
- GET `/api/me` (authenticated)
  - Response: `200` user object (profil sesuai token)

6) Response examples

- Success login (200):

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Admin Utama",
    "email": "admin@booking.com",
    "role": "admin",
    "phone": "081111111"
  }
}
```

- Error contoh (401):

```json
{ "message": "Email atau password salah" }
```

7) Notes untuk mobile developer
- Selalu sertakan header `Authorization: Bearer <token>` untuk endpoint yang membutuhkan autentikasi.
- Tampilkan pesan error dari properti `message` untuk UX sederhana.
- Gunakan `409` response untuk menampilkan konflik jadwal ke pengguna.
- Untuk menampilkan daftar booking di mobile: gunakan `GET /api/bookings?date=YYYY-MM-DD&room_id=1`.

---

Jika Anda mau, saya bisa:
- menambahkan file `API.openapi.yml` atau `swagger.json` otomatis, atau
- membuat contoh Postman collection.