const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM rooms ORDER BY name');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
  return rows[0];
}

async function create({ name, capacity }) {
  const { rows } = await pool.query(
    'INSERT INTO rooms (name, capacity) VALUES ($1, $2) RETURNING id',
    [name, capacity]
  );
  return rows[0].id;
}

async function update(id, { name, capacity }) {
  await pool.query(
    'UPDATE rooms SET name = $1, capacity = $2 WHERE id = $3',
    [name, capacity, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
}

module.exports = { findAll, findById, create, update, remove };