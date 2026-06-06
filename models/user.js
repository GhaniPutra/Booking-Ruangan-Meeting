const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function create({ name, email, password, role = 'customer', phone }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, email, password, role, phone || null]
  );
  return rows[0].id;
}

async function findAll() {
  const { rows } = await pool.query('SELECT id, name, email, role, phone, created_at FROM users');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function update(id, { name, email, role, phone }) {
  await pool.query(
    'UPDATE users SET name = $1, email = $2, role = $3, phone = $4 WHERE id = $5',
    [name, email, role, phone, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, create, findAll, findById, update, remove };