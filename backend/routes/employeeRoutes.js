const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser
} = require('../controllers/userController');

// GET /api/employees
router.get('/', getUsers);

// POST /api/employees
router.post('/', createUser);

module.exports = router;
