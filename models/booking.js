const pool = require('../config/db');

async function findAll(filters = {}) {
  let query = `
    SELECT b.*, r.name AS room_name, u.name AS customer_name, u.email AS customer_email
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (filters.room_id) {
    query += ` AND b.room_id = $${i++}`;
    params.push(filters.room_id);
  }
  if (filters.date) {
    query += ` AND b.date = $${i++}`;
    params.push(filters.date);
  }
  if (filters.user_id) {
    query += ` AND b.user_id = $${i++}`;
    params.push(filters.user_id);
  }

  query += ' ORDER BY b.date, b.start_time';
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, u.name AS customer_name, u.email AS customer_email
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [id]
  );
  return rows[0];
}

async function isConflict({ room_id, date, start_time, end_time, excludeId = null }) {
  let query = `
    SELECT COUNT(*) AS conflict_count
    FROM bookings
    WHERE room_id = $1 AND date = $2 AND start_time < $3 AND end_time > $4
  `;
  const params = [room_id, date, end_time, start_time];

  if (excludeId) {
    query += ` AND id != $5`;
    params.push(excludeId);
  }

  const { rows } = await pool.query(query, params);
  return parseInt(rows[0].conflict_count) > 0;
}

async function create({ room_id, user_id, date, start_time, end_time }) {
  const { rows } = await pool.query(
    'INSERT INTO bookings (room_id, user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [room_id, user_id, date, start_time, end_time]
  );
  return rows[0].id;
}

async function update(id, { room_id, date, start_time, end_time }) {
  await pool.query(
    'UPDATE bookings SET room_id = $1, date = $2, start_time = $3, end_time = $4 WHERE id = $5',
    [room_id, date, start_time, end_time, id]
  );
}

async function updateStatus(id, status) {
  await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
}

module.exports = { findAll, findById, isConflict, create, update, updateStatus, remove };