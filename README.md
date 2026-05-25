# Meeting Room Booking

> Panduan cepat untuk meng-clone, menginstal dependensi, menjalankan migrasi database, dan menjalankan aplikasi ini.

## Prasyarat
- Node.js v16+ (disarankan v18 atau lebih baru)
- MySQL server berjalan dan akun pengguna yang memiliki hak membuat database
- Git

## Clone repository

```bash
git clone https://github.com/GhaniPutra/Booking-Ruangan-Meeting.git
cd meeting-room-booking
```

Ganti `https://github.com/GhaniPutra/Booking-Ruangan-Meeting.git` dengan URL repo sebenarnya.

## Instal dependensi

Jalankan:

```bash
npm install
```

Jika ingin mode pengembangan dengan auto-restart, gunakan `nodemon` via script `dev`.

## File environment (.env)

Buat file `.env` di root repository dengan variabel berikut:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=meeting_booking_db
JWT_SECRET=secretsuperkuat
```

Catatan:
- `DB_USER` harus punya hak untuk membuat database saat menjalankan migrasi (`CREATE DATABASE`).
- Sesuaikan `PORT` bila diperlukan.

## Migrasi database

Script migrasi akan membuat database (jika belum ada) dan membuat tabel yang diperlukan.

Jalankan:

```bash
npm run migrate
```

Anda akan melihat output log yang menandakan pembuatan database, tabel, dan index.

## Seed (data contoh)

Untuk mengisi data contoh (users, rooms, bookings) jalankan:

```bash
npm run seed
```

Script ini akan menghapus isi tabel lalu memasukkan data contoh. Gunakan di lingkungan development saja.

Default credentials (yang dibuat oleh seeder):
- Admin: admin@booking.com / admin123
- Customer: budi@email.com / customer123

## Menjalankan aplikasi

Di environment production:

```bash
npm start
```

Di mode pengembangan (auto-reload):

```bash
npm run dev
```

Buka browser ke `http://localhost:3000` (atau `http://localhost:<PORT>` jika Anda mengubah `PORT`).

API endpoint utama:
- `GET /` — health check
- Route API ada di folder `routes/` (mis. `/api/rooms`, `/api/bookings`, `/api/users`, `/api/auth`, `/api/me`).

## Catatan penting
- Pastikan MySQL menerima koneksi dari host yang Anda pakai (`localhost`/remote). Jika menggunakan user tanpa hak `CREATE DATABASE`, buat database manual dan set `DB_NAME` sesuai.
- Jika terjadi error koneksi database, periksa variabel `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` di `.env`.
- JWT secret disimpan di `JWT_SECRET`.

## Troubleshooting singkat
- `ER_ACCESS_DENIED_ERROR`: periksa username/password MySQL.
- `ECONNREFUSED`: pastikan MySQL berjalan dan `DB_HOST` benar.
- Migrasi gagal karena hak akses: buat database manual atau gunakan user dengan hak yang sesuai.

## Struktur singkat repo
- `server.js` — entry point aplikasi
- `migrate.js` — script migrasi DB (`npm run migrate`)
- `seed.js` — script seeder (`npm run seed`)
- `routes/`, `controllers/`, `models/` — logika aplikasi
- `public/` — aset frontend statis

---

Jika Anda ingin, saya bisa menambahkan `.env.example` otomatis ke repo, atau menambahkan instruksi untuk Docker/MySQL container.
