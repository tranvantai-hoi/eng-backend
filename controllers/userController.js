const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu
const jwt = require('jsonwebtoken');


const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user theo username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản hoặc mật khẩu không chính xác' 
      });
    }

    // 2. So sánh mật khẩu (password nhập vào vs password đã mã hóa trong DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản hoặc mật khẩu không chính xác' 
      });
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'secret_key_tam_thoi_123456', 
      { expiresIn: '1d' } 
    );

    // 4. Trả về thông tin
    const userData = { ...user };
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token: token,
      user: userData
    });

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      delete user.password; 
      return res.status(200).json({ success: true, data: user });
    }

    const users = await User.findAll();
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    res.status(200).json({ success: true, data: safeUsers, count: safeUsers.length });
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo user mới
const createUser = async (req, res) => {
  try {
    // [SỬA] Thêm fullname vào destructuring
    const { username, password, role, fullname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Thiếu username hoặc password' });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // [SỬA] Truyền fullname vào User.create
    const newUser = await User.create(username, hashedPassword, role || 'admin', fullname);
    
    if (newUser) delete newUser.password;

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Lỗi tạo user:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;

    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updatePassword(id, hashedPassword);

    return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });

  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật User
const updateUserInfo = async (req, res) => {
  try {
    // [SỬA] Thêm fullname
    const { id, username, password, role, fullname } = req.body;

    if (!id) return res.status(400).json({ message: 'Thiếu ID user' });

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // [SỬA] Truyền fullname vào User.update
    const updatedUser = await User.update(id, username, hashedPassword, role, fullname);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy user để cập nhật' });
    }

    delete updatedUser.password;

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getUsers,
  createUser,
  changePassword,
  updateUserInfo,
  login,
};