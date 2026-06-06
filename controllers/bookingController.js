const bookingModel = require('../models/booking');
const roomModel = require('../models/room');
const userModel = require('../models/user');

async function list(req, res) {
  try {
    const filters = {};
    if (req.query.room_id) filters.room_id = req.query.room_id;
    if (req.query.date) filters.date = req.query.date;

    if (req.user.role === 'customer') {
      if (req.query.my_bookings === 'true' || req.query.user_id) {
        filters.user_id = req.user.id;
      }
    } else {
      if (req.query.user_id) filters.user_id = req.query.user_id;
    }

    const bookings = await bookingModel.findAll(filters);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data booking' });
  }
}

async function detail(req, res) {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    // Customer hanya bisa lihat punya sendiri
    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil detail booking' });
  }
}

async function create(req, res) {
  try {
    const { room_id, date, start_time, end_time } = req.body;
    let user_id = req.user.id;

    // Admin bisa tentukan user_id, customer pakai punya sendiri
    if (req.user.role === 'admin' && req.body.user_id) {
      user_id = req.body.user_id;
    }

    // Validasi input
    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Cek ruangan ada
    const room = await roomModel.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });

    // Cek user ada
    const user = await userModel.findById(user_id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Validasi jam
    if (start_time >= end_time) {
      return res.status(400).json({ message: 'Jam selesai harus lebih besar dari jam mulai' });
    }

    // Cek bentrok
    const conflict = await bookingModel.isConflict({ room_id, date, start_time, end_time });
    if (conflict) {
      return res.status(409).json({ message: 'Jadwal bentrok dengan booking lain' });
    }

    const id = await bookingModel.create({ room_id, user_id, date, start_time, end_time });
    res.status(201).json({ message: 'Booking berhasil dibuat', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat booking' });
  }
}

async function update(req, res) {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    // Cek kepemilikan
    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const { room_id, date, start_time, end_time } = req.body;
    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ message: 'Jam selesai harus lebih besar dari jam mulai' });
    }

    // Cek bentrok (kecualikan booking ini sendiri)
    const conflict = await bookingModel.isConflict({
      room_id,
      date,
      start_time,
      end_time,
      excludeId: booking.id,
    });
    if (conflict) {
      return res.status(409).json({ message: 'Jadwal bentrok dengan booking lain' });
    }

    await bookingModel.update(req.params.id, { room_id, date, start_time, end_time });
    res.json({ message: 'Booking berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui booking' });
  }
}

async function remove(req, res) {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await bookingModel.remove(req.params.id);
    res.json({ message: 'Booking berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus booking' });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    await bookingModel.updateStatus(req.params.id, status);
    res.json({ message: `Status booking berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengubah status booking' });
  }
}

module.exports = { list, detail, create, update, updateStatus, remove };