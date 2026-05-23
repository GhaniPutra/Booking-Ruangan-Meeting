const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM rooms ORDER BY name');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
  return rows[0];
}

async function create({ name, capacity }) {
  const [result] = await pool.query(
    'INSERT INTO rooms (name, capacity) VALUES (?, ?)',
    [name, capacity]
  );
  return result.insertId;
}

async function update(id, { name, capacity }) {
  await pool.query(
    'UPDATE rooms SET name = ?, capacity = ? WHERE id = ?',
    [name, capacity, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };