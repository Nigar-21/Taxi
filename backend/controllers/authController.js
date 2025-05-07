const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, phone, password, role } = req.body;

  try {
    // Əgər istifadəçi artıq varsa
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu nömrə artıq qeydiyyatdan keçib' });
    }

    // Şifrəni hash et (təhlükəsizlik üçün)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni istifadəçi yaradılır
    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: 'Qeydiyyat uğurludur', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server xətası', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Şifrə yanlışdır' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    res.status(200).json({ message: 'Daxil oldunuz', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server xətası', error: error.message });
  }
};
