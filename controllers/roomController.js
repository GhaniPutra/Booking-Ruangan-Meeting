const roomModel = require('../models/room');

async function list(req, res) {
  try {
    const rooms = await roomModel.findAll();
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data ruangan' });
  }
}

async function detail(req, res) {
  try {
    const room = await roomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data ruangan' });
  }
}

async function create(req, res) {
  try {
    const { name, capacity } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ message: 'Nama dan kapasitas wajib diisi' });
    }
    const id = await roomModel.create({ name, capacity });
    res.status(201).json({ message: 'Ruangan berhasil ditambahkan', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan ruangan' });
  }
}

async function update(req, res) {
  try {
    const { name, capacity } = req.body;
    const room = await roomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });

    await roomModel.update(req.params.id, { name, capacity });
    res.json({ message: 'Ruangan berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui ruangan' });
  }
}

async function remove(req, res) {
  try {
    const room = await roomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Ruangan tidak ditemukan' });

    await roomModel.remove(req.params.id);
    res.json({ message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus ruangan' });
  }
}

module.exports = { list, detail, create, update, remove };