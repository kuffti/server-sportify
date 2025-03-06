const express = require('express');
const router = express.Router();
const { getGroups, createGroup, joinGroup, leaveGroup, deleteGroup } = require('../controllers/groupController');
const protect = require('../middleware/auth');

// נתיבים ציבוריים
router.get('/', getGroups);

// נתיבים מוגנים
router.post('/', protect, createGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.delete('/:id', protect, deleteGroup);

module.exports = router;
