# Panduan Penjelasan Alur Backend (Presentasi)

Dokumen ini disusun untuk mempermudah penjelasan alur kerja backend (Express.js) saat presentasi, mencakup alur **Autentifikasi** (Registrasi & Login), **Middleware Penjaga (Guard)**, serta alur **CRUD** (Studi Kasus: Booking Ruangan).

---

## 1. Alur Autentifikasi (Authentication Flow)

Alur autentifikasi bertanggung jawab atas pendaftaran pengguna baru dan pembuatan token akses (JWT) ketika login berhasil.

### A. Alur Registrasi (Register)
1. **Endpoint Route**: Client mengirimkan request `POST` ke `/api/auth/register`.
   - **Lokasi File**: `routes/auth.js`
   - **Line untuk Dijelaskan**: Line 4 (`router.post('/register', register);`) mengarahkan request ke fungsi `register` di Controller.
2. **Controller Logic**:
   - **Lokasi File**: `controllers/authController.js`
   - **Poin Penjelasan**:
     - **Line 7-10**: Menerima request body (`name`, `email`, `password`, `phone`) dan memvalidasi kelengkapannya.
     - **Line 12-15**: Memeriksa apakah email sudah terdaftar melalui Model `userModel.findByEmail`.
     - **Line 17**: Mengamankan password dengan melakukan hashing menggunakan Bcrypt (`await hashPassword(password)`).
     - **Line 18**: Menyimpan user baru ke database via Model dengan default role `customer`.
3. **Model & Database Query**:
   - **Lokasi File**: `models/user.js`
   - **Line untuk Dijelaskan**: Line 9-13 menjalankan query `INSERT INTO users ... RETURNING id` untuk memasukkan data ke PostgreSQL.

---

### B. Alur Masuk (Login)
1. **Endpoint Route**: Client mengirimkan request `POST` ke `/api/auth/login`.
   - **Lokasi File**: `routes/auth.js`
   - **Line untuk Dijelaskan**: Line 5 (`router.post('/login', login);`) mengarahkan request ke fungsi `login` di Controller.
2. **Controller Logic**:
   - **Lokasi File**: `controllers/authController.js`
   - **Poin Penjelasan**:
     - **Line 34-37**: Mencari user di database berdasarkan email. Jika tidak ditemukan, return status `401 Unauthorized`.
     - **Line 39-42**: Membandingkan password plain-text dari input dengan password ter-hash di database menggunakan `comparePassword`.
     - **Line 44**: Jika password cocok, panggil `generateToken({ id: user.id, role: user.role })` dari helper JWT untuk menghasilkan token akses.
     - **Line 45-54**: Mengembalikan response berisi token JWT dan data user singkat ke client.

---

## 2. Middleware & Sistem Penjaga (Auth Middleware)

Middleware digunakan untuk memproteksi route-route privat agar hanya bisa diakses oleh user yang terautentikasi dan memiliki hak akses (role) yang sesuai.

### A. Autentikasi Token (`authenticate`)
Setiap request ke route terproteksi wajib menyertakan token di header `Authorization: Bearer <token>`.
- **Lokasi File**: `middlewares/auth.js`
- **Poin Penjelasan**:
  - **Line 4-7**: Mengambil authorization header dan memastikan formatnya diawali dengan `Bearer `.
  - **Line 11-13**: Memverifikasi validitas token dengan `verifyToken(token)`. Jika valid, payload didecode (`{ id, role }`) lalu disimpan ke objek request `req.user` agar bisa diakses oleh controller selanjutnya. Panggil `next()` untuk melanjutkan.

### B. Otorisasi Peran (`authorize`)
Memastikan hanya peran tertentu (misalnya, hanya `admin`) yang dapat mengakses endpoint sensitif.
- **Lokasi File**: `middlewares/auth.js`
- **Poin Penjelasan**:
  - **Line 20-25**: Menerima daftar role yang diperbolehkan (`...roles`). Jika `req.user.role` yang tersimpan tidak terdaftar di daftar role tersebut, maka request ditolak dengan status `403 Forbidden`.

---

## 3. Alur CRUD (Studi Kasus: Booking Ruangan)

Penjelasan lengkap bagaimana data dimanipulasi dengan aman berdasarkan level otorisasi.

### A. Rute Utama Booking (Routes)
Semua rute booking membutuhkan middleware `authenticate`.
- **Lokasi File**: `routes/bookings.js`
- **Poin Penjelasan**:
  - **Line 5 (Read - List)**: `router.get('/', authenticate, list);`
  - **Line 6 (Read - Detail)**: `router.get('/:id', authenticate, detail);`
  - **Line 7 (Create)**: `router.post('/', authenticate, create);`
  - **Line 8 (Update)**: `router.put('/:id', authenticate, update);`
  - **Line 9 (Update Status - Admin Only)**: `router.patch('/:id/status', authenticate, authorize('admin'), updateStatus);`
  - **Line 10 (Delete)**: `router.delete('/:id', authenticate, remove);`

---

### B. Proses Pembuatan Data (Create Booking)
1. **Controller**: `controllers/bookingController.js`
   - **Line 47-52**: Menentukan `user_id`. Jika yang login adalah `admin` dan menyertakan `user_id` di body, admin bisa membooking atas nama user lain. Jika yang login adalah `customer`, server mengabaikan input body dan otomatis menggunakan `req.user.id` demi keamanan.
   - **Line 60-65**: Memvalidasi apakah ruangan dan user benar-benar ada di database.
   - **Line 68-70**: Memastikan `start_time` tidak lebih besar atau sama dengan `end_time`.
   - **Line 73-76**: Memanggil `bookingModel.isConflict` untuk mencegah bentrok jadwal.
   - **Line 78-79**: Jika aman, panggil Model untuk create data dan kembalikan status `201 Created` beserta ID Booking yang baru.
2. **Model (Conflict Check & Insert)**:
   - **Lokasi File**: `models/booking.js`
   - **Line 44-59 (`isConflict`)**: Melakukan query untuk menghitung apakah ada booking lain di ruangan yang sama, di tanggal yang sama, dengan irisan jam mulai dan jam selesai.
   - **Line 61-67 (`create`)**: Menjalankan query `INSERT INTO bookings ...` untuk menyimpan reservasi.

---

### C. Proses Pengambilan Data (Read / List & Detail)
1. **Mengambil Semua Booking (List)**:
   - **Lokasi File**: `controllers/bookingController.js`
   - **Line 11-17**: Membaca parameter filter. Jika yang mengakses adalah `customer`, sistem memaksa query hanya memfilter data miliknya sendiri (`filters.user_id = req.user.id`). Jika `admin`, maka admin dapat memfilter atau melihat seluruh booking yang masuk.
   - **Query Database**: `models/booking.js` (`findAll`) secara dinamis menyusun klausa SQL WHERE berdasarkan filter yang aktif.
2. **Mengambil Detail Booking (Detail)**:
   - **Lokasi File**: `controllers/bookingController.js`
   - **Line 33-35**: Mengamankan detail booking. Jika user yang meminta adalah `customer` dan ID booking tersebut milik user lain, maka akses langsung ditolak (`403 Forbidden`).

---

### E. Proses Pembaruan Data (Update Booking)
1. **Controller**: `controllers/bookingController.js`
   - **Line 92-94**: Proteksi kepemilikan. Hanya pemilik booking (atau admin) yang diperbolehkan mengubah booking.
   - **Line 106-112**: Memeriksa bentrok jadwal baru menggunakan `isConflict`, namun mengecualikan ID booking saat ini agar tidak mendeteksi bentrok dengan dirinya sendiri (`excludeId: booking.id`).
   - **Line 117**: Menyimpan perubahan ke database via model.
2. **Model**: `models/booking.js` (`update`) menjalankan query SQL `UPDATE bookings SET ...`.

---

### F. Proses Penghapusan Data (Delete Booking)
1. **Controller**: `controllers/bookingController.js`
   - **Line 130-132**: Memvalidasi kepemilikan. `customer` hanya boleh menghapus booking milik mereka sendiri.
   - **Line 134**: Menghapus data dari database via Model.
2. **Model**: `models/booking.js` (`remove`) menjalankan query `DELETE FROM bookings WHERE id = $1`.
