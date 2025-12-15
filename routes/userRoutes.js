const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserInfo } = require('../controllers/userController');

// GET /api/users (Lấy tất cả hoặc ?id=...)
router.get('/', getUsers);

// POST /api/users/create (Thêm user mới)
router.post('/create', createUser);

// POST /api/users/update (Cập nhật user - dùng POST như cách bạn làm với student)
router.post('/update', updateUserInfo);

module.exports = router;