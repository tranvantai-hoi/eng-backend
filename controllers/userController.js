const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu

// Lấy danh sách users hoặc 1 user theo id
const getUsers = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      // Xóa password trước khi trả về client để bảo mật
      delete user.password; 
      
      return res.status(200).json({
        success: true,
        data: user
      });
    }

    const users = await User.findAll();
    // Xóa password trong danh sách
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    res.status(200).json({
      success: true,
      data: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo user mới
const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validation cơ bản
    if (!username || !password) {
      return res.status(400).json({ message: 'Thiếu username hoặc password' });
    }

    // Kiểm tra trùng username
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(username, hashedPassword, role || 'admin');
    
    delete newUser.password; // Không trả password về

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Lỗi tạo user:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật User
const updateUserInfo = async (req, res) => {
  try {
    const { id, username, password, role } = req.body;

    if (!id) return res.status(400).json({ message: 'Thiếu ID user' });

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Truyền hashedPassword (hoặc null) vào model
    const updatedUser = await User.update(id, username, hashedPassword, role);

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
  updateUserInfo
};