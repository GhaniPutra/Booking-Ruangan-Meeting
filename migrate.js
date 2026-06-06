// migrate.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  console.log(`Database '${process.env.DB_NAME}' siap.`);

  await connection.query(`USE \`${process.env.DB_NAME}\``);

  await connection.query(`DROP TABLE IF EXISTS bookings, rooms, users`);
  console.log('Tabel lama dibersihkan.');

  // Buat tabel users
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabel users siap.');

  // Buat tabel rooms
  await connection.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      capacity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabel rooms siap.');

  // Buat tabel bookings
  await connection.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('Tabel bookings siap.');

  // --- Buat index dengan pengecekan manual ---
  const [existingIndexes] = await connection.query(`
    SHOW INDEX FROM bookings WHERE Key_name IN ('idx_booking_room_date', 'idx_booking_user')
  `);
  const indexNames = existingIndexes.map(row => row.Key_name);

  if (!indexNames.includes('idx_booking_room_date')) {
    await connection.query(`CREATE INDEX idx_booking_room_date ON bookings (room_id, date)`);
    console.log('Index idx_booking_room_date dibuat.');
  } else {
    console.log('Index idx_booking_room_date sudah ada.');
  }

  if (!indexNames.includes('idx_booking_user')) {
    await connection.query(`CREATE INDEX idx_booking_user ON bookings (user_id)`);
    console.log('Index idx_booking_user dibuat.');
  } else {
    console.log('Index idx_booking_user sudah ada.');
  }

  await connection.end();
  console.log('✅ Migrasi selesai!');
}

migrate().catch((err) => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});