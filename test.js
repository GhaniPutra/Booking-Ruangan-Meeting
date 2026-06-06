const pool = require('./config/db.js');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    console.log('✅ Koneksi berhasil:', rows);
  } catch (err) {
    console.error('❌ Gagal konek:', err.message);
  } finally {
    await pool.end();
  }
}

test();