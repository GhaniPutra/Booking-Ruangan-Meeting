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

## Menjalankan Aplikasi

Aplikasi ini terdiri dari dua bagian yang harus dijalankan bersamaan: **Backend API** dan **Frontend Web (React + Vite)**.

### 1. Jalankan Backend API
1. Pastikan dependensi sudah terinstal di root folder:
   ```bash
   npm install
   ```
2. Jalankan migrasi dan seeder database untuk memperbarui skema (termasuk kolom status baru):
   ```bash
   npm run migrate
   npm run seed
   ```
3. Mulai server backend:
   - **Mode Pengembangan (auto-reload):**
     ```bash
     npm run dev
     ```
   - **Mode Production:**
     ```bash
     npm start
     ```
   *Backend akan berjalan di: `http://localhost:3000`*

### 2. Jalankan Frontend Web (React + Vite)
1. Masuk ke folder frontend:
   ```bash
   cd booking-ruangan-web
   ```
2. Instal dependensi frontend:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan frontend:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di: `http://localhost:5173` (atau port lain yang tertera di terminal)*

---

## 🚀 Pembaruan Terbaru (Recent Updates)

Kami baru saja melakukan perombakan besar untuk meningkatkan UI/UX serta menambahkan pemisahan hak akses (Role-Based Access Control):

### 1. Skema Database & Seeder Baru
*   Menambahkan kolom `status` (`ENUM('pending', 'approved', 'rejected')`) pada tabel `bookings`. Status default saat membuat booking baru adalah `'pending'`.
*   Data contoh di `seed.js` telah disesuaikan dengan tanggal hari ini (`2026-06-06`) untuk memudahkan simulasi dashboard.

### 2. Pemisahan Role (Admin & Customer)
Sistem sekarang memiliki batasan akses yang jelas di frontend maupun backend:
*   **Customer Role:**
    *   **Dashboard Personal:** Menampilkan ruangan yang sedang mereka gunakan hari ini (*Ruangan Kamu Hari Ini*) dan daftar ruangan kosong yang siap dipesan hari ini (*Ruangan Kosong Hari Ini*).
    *   **Booking Page:** Hanya dapat melihat daftar pemesanan milik sendiri (`GET /bookings?my_bookings=true`), membuat pemesanan baru, serta membatalkan (Hapus) pemesanan jika statusnya masih `PENDING`.
    *   *Akses Dibatasi:* Tidak dapat mengelola user lain atau memodifikasi data ruangan.
*   **Admin Role:**
    *   **Dashboard Admin:** Menampilkan metrik sistem (Total Ruangan, Booking Hari Ini, Booking Pending, Total User) serta daftar antrean persetujuan booking.
    *   **Fitur Approve/Reject:** Admin dapat menyetujui (`approved`) atau menolak (`rejected`) booking yang diajukan customer langsung dari dashboard atau list booking.
    *   **Manajemen Ruangan (Rooms CRUD):** Admin dapat menambah, mengubah (Edit), dan menghapus ruangan langsung menggunakan dialog modal modern di halaman Ruangan.
    *   **Manajemen Pengguna (Users CRUD):** Ditambahkan halaman khusus `/users` bagi Admin untuk mengelola akun pengguna (Tambah, Edit detail/role, Hapus).

### 3. Perbaikan UI/UX
*   Mengimplementasikan tema modern **Dark Glassmorphism** (efek blur latar belakang, gradasi warna ungu-biru HSL yang premium, dan hover micro-animations).
*   Memperbaiki bug tampilan waktu (mencegah pesan error `Invalid Date` karena database memisah tipe data DATE dan TIME).

---

## Catatan penting
- Pastikan MySQL menerima koneksi dari host yang Anda pakai (`localhost`/remote). Jika menggunakan user tanpa hak `CREATE DATABASE`, buat database manual dan set `DB_NAME` sesuai.
- Jika terjadi error koneksi database, periksa variabel `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` di `.env`.
- JWT secret disimpan di `JWT_SECRET`.

## Troubleshooting singkat
- `ER_ACCESS_DENIED_ERROR`: periksa username/password MySQL.
- `ECONNREFUSED`: pastikan MySQL berjalan dan `DB_HOST` benar.
- Migrasi gagal karena hak akses: buat database manual atau gunakan user dengan hak yang sesuai.

## Struktur singkat repo
- `server.js` — entry point aplikasi backend
- `migrate.js` — script migrasi DB (`npm run migrate`)
- `seed.js` — script seeder (`npm run seed`)
- `routes/`, `controllers/`, `models/` — logika aplikasi backend
- `booking-ruangan-web/` — folder aplikasi frontend (React + Vite)
  - `src/pages/` — Halaman frontend (Dashboard, Rooms, Bookings, Users, Profile, Login, Register)
  - `src/components/` — Komponen pendukung (Layout, Sidebar, ProtectedRoute)
  - `src/api/axios.js` — Konfigurasi Axios API client (base URL: `http://localhost:3000/api`)

---

Jika Anda ingin, saya bisa menambahkan `.env.example` otomatis ke repo, atau menambahkan instruksi untuk Docker/MySQL container.
