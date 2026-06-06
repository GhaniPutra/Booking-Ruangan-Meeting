// migrate.js
require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Koneksi ke PostgreSQL berhasil.');

  // Hapus tabel lama (urutan penting karena FK)
  await client.query(`DROP TABLE IF EXISTS bookings, rooms, users`);
  console.log('Tabel lama dibersihkan.');

  // Buat tabel users
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id        SERIAL PRIMARY KEY,
      name      VARCHAR(100) NOT NULL,
      email     VARCHAR(100) UNIQUE NOT NULL,
      password  VARCHAR(255) NOT NULL,
      role      VARCHAR(10)  NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      phone     VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Tabel users siap.');

  // Buat tabel rooms
  await client.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id        SERIAL PRIMARY KEY,
      name      VARCHAR(100) NOT NULL,
      capacity  INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Tabel rooms siap.');

  // Buat tabel bookings
  await client.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id         SERIAL PRIMARY KEY,
      room_id    INT NOT NULL,
      user_id    INT NOT NULL,
      date       DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time   TIME NOT NULL,
      status     VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('Tabel bookings siap.');

  // Buat index
  await client.query(`CREATE INDEX IF NOT EXISTS idx_booking_room_date ON bookings (room_id, date)`);
  console.log('Index idx_booking_room_date siap.');

  await client.query(`CREATE INDEX IF NOT EXISTS idx_booking_user ON bookings (user_id)`);
  console.log('Index idx_booking_user siap.');

  await client.end();
  console.log('✅ Migrasi selesai!');
}

migrate().catch((err) => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});