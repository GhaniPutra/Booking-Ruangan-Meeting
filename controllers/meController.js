const userModel = require('../models/user');

async function me(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data profil' });
  }
}

module.exports = { me };