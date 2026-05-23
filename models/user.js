const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function create({ name, email, password, role = 'customer', phone }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
    [name, email, password, role, phone || null]
  );
  return result.insertId;
}

async function findAll() {
  const [rows] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
}

async function update(id, { name, email, role, phone }) {
  await pool.query(
    'UPDATE users SET name = ?, email = ?, role = ?, phone = ? WHERE id = ?',
    [name, email, role, phone, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = { findByEmail, create, findAll, findById, update, remove };