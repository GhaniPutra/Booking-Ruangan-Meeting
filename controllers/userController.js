const userModel = require('../models/user');
const { hashPassword } = require('../utils/bcrypt');

async function list(req, res) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
}

async function detail(req, res) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
}

async function create(req, res) {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashed = await hashPassword(password);
    const id = await userModel.create({ name, email, password: hashed, role: role || 'customer', phone });
    res.status(201).json({ message: 'User berhasil ditambahkan', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan user' });
  }
}

async function update(req, res) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const { name, email, role, phone } = req.body;
    await userModel.update(req.params.id, { name, email, role, phone });
    res.json({ message: 'User berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui user' });
  }
}

async function remove(req, res) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    await userModel.remove(req.params.id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
}

module.exports = { list, detail, create, update, remove };