const userModel = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashed = await hashPassword(password);
    await userModel.create({ name, email, password: hashed, role: 'customer', phone });

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

module.exports = { register, login };