const bcrypt = require("bcrypt");
const User = require("../models/User");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email không tồn tại" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Sai mật khẩu" });

    res.status(200).json({ message: "Đăng nhập thành công!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
