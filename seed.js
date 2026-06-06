require('dotenv').config();
const pool = require('./config/db');
const { hashPassword } = require('./utils/bcrypt');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🧹 Menghapus data lama...');

    // Hapus data (urutan penting karena FK)
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM rooms');
    await client.query('DELETE FROM users');

    // Reset sequence (auto increment) agar ID mulai dari 1 lagi
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE rooms_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

    console.log('✅ Data lama dibersihkan.');

    // ========== USERS ==========
    console.log('👤 Membuat users...');
    const adminPass = await hashPassword('admin123');
    const userPass = await hashPassword('customer123');

    const { rowCount: userCount } = await client.query(
      `INSERT INTO users (name, email, password, role, phone) VALUES
       ('Admin Utama',   'admin@booking.com', $1, 'admin',    '081111111'),
       ('Budi Santoso',  'budi@email.com',    $2, 'customer', '082222222'),
       ('Siti Aminah',   'siti@email.com',    $3, 'customer', '083333333'),
       ('Andi Pratama',  'andi@email.com',    $4, 'customer', '084444444')`,
      [adminPass, userPass, userPass, userPass]
    );
    console.log(`   ${userCount} users dibuat.`);

    // ========== ROOMS ==========
    console.log('🏢 Membuat ruangan...');
    const { rowCount: roomCount } = await client.query(
      `INSERT INTO rooms (name, capacity) VALUES
       ('Ruang Anggrek',   10),
       ('Ruang Mawar',     20),
       ('Ruang Melati',     5),
       ('Aula Serbaguna',  50),
       ('Ruang Kenanga',   15)`
    );
    console.log(`   ${roomCount} ruangan dibuat.`);

    // ========== BOOKINGS ==========
    console.log('📅 Membuat booking...');
    const bookings = [
      [1, 2, '2026-06-06', '09:00', '10:00', 'approved'],
      [2, 3, '2026-06-06', '10:00', '12:00', 'approved'],
      [3, 4, '2026-06-06', '08:00', '09:00', 'approved'],
      [4, 2, '2026-06-07', '13:00', '15:00', 'pending'],
      [1, 3, '2026-06-07', '09:00', '11:00', 'pending'],
      [5, 4, '2026-06-07', '14:00', '16:00', 'rejected'],
      [2, 2, '2026-06-08', '08:00', '10:00', 'approved'],
      [1, 3, '2026-06-08', '10:00', '11:00', 'approved'],
    ];

    for (const b of bookings) {
      await client.query(
        'INSERT INTO bookings (room_id, user_id, date, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6)',
        b
      );
    }
    console.log(`   ${bookings.length} booking dibuat.`);

    console.log('\n🎉 Seeder selesai! Data siap digunakan.');
    console.log('   Admin   : admin@booking.com / admin123');
    console.log('   Customer: budi@email.com / customer123');
    console.log('            siti@email.com / customer123');
    console.log('            andi@email.com / customer123');

  } catch (error) {
    console.error('❌ Seeder gagal:', error);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seed();