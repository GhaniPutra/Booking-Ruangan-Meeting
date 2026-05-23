require('dotenv').config();
const pool = require('./config/db');
const { hashPassword } = require('./utils/bcrypt');

async function seed() {
  const connection = await pool.getConnection();
  try {
    console.log('🧹 Menghapus data lama...');

    // Hapus data booking dulu (karena FK), lalu rooms dan users
    await connection.query('DELETE FROM bookings');
    await connection.query('DELETE FROM rooms');
    await connection.query('DELETE FROM users');
    // Reset auto increment supaya ID mulai dari 1 lagi
    await connection.query('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE rooms AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');

    console.log('✅ Data lama dibersihkan.');

    // ========== USERS ==========
    console.log('👤 Membuat users...');
    const adminPass = await hashPassword('admin123');
    const userPass = await hashPassword('customer123');

    const [resultUsers] = await connection.query(
      `INSERT INTO users (name, email, password, role, phone) VALUES 
       ('Admin Utama', 'admin@booking.com', ?, 'admin', '081111111'),
       ('Budi Santoso', 'budi@email.com', ?, 'customer', '082222222'),
       ('Siti Aminah', 'siti@email.com', ?, 'customer', '083333333'),
       ('Andi Pratama', 'andi@email.com', ?, 'customer', '084444444')`,
      [adminPass, userPass, userPass, userPass]
    );
    console.log(`   ${resultUsers.affectedRows} users dibuat.`);

    // ========== ROOMS ==========
    console.log('🏢 Membuat ruangan...');
    const [resultRooms] = await connection.query(
      `INSERT INTO rooms (name, capacity) VALUES 
       ('Ruang Anggrek', 10),
       ('Ruang Mawar', 20),
       ('Ruang Melati', 5),
       ('Aula Serbaguna', 50),
       ('Ruang Kenanga', 15)`
    );
    console.log(`   ${resultRooms.affectedRows} ruangan dibuat.`);

    // ========== BOOKINGS ==========
    console.log('📅 Membuat booking...');
    // ID user: 1=admin, 2=budi, 3=siti, 4=andi
    // ID room: 1=Anggrek, 2=Mawar, 3=Melati, 4=Aula, 5=Kenanga
    const bookings = [
      [1, 2, '2026-05-25', '09:00', '10:00'], // Anggrek, Budi
      [2, 3, '2026-05-25', '10:00', '12:00'], // Mawar, Siti
      [3, 4, '2026-05-26', '08:00', '09:00'], // Melati, Andi
      [4, 2, '2026-05-26', '13:00', '15:00'], // Aula, Budi
      [1, 3, '2026-05-27', '09:00', '11:00'], // Anggrek, Siti
      [5, 4, '2026-05-27', '14:00', '16:00'], // Kenanga, Andi
      [2, 2, '2026-05-28', '08:00', '10:00'], // Mawar, Budi
      [1, 3, '2026-05-28', '10:00', '11:00'], // Anggrek, Siti (berbeda jam, tidak bentrok)
    ];

    for (const b of bookings) {
      await connection.query(
        'INSERT INTO bookings (room_id, user_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
        b
      );
    }
    console.log(`   ${bookings.length} booking dibuat.`);

    console.log('\n🎉 Seeder selesai! Data siap digunakan.');
    console.log('   Admin  : admin@booking.com / admin123');
    console.log('   Customer: budi@email.com / customer123');
    console.log('            siti@email.com / customer123');
    console.log('            andi@email.com / customer123');

  } catch (error) {
    console.error('❌ Seeder gagal:', error);
  } finally {
    connection.release();
    await pool.end();
    process.exit(0);
  }
}

seed();