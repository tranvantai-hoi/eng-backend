const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserInfo, login, changePassword } = require('../controllers/userController');

// GET /api/users (Lấy tất cả hoặc ?id=...)
router.get('/', getUsers);

// POST /api/users/create (Thêm user mới)
router.post('/create', createUser);

router.post('/change-password', changePassword);

// POST /api/users/update (Cập nhật user - dùng POST như cách bạn làm với student)
router.post('/update', updateUserInfo);

// POST /api/users/login (Đường dẫn mới cho đăng nhập)
router.post('/login', login);

module.exports = router;