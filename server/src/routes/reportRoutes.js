const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getManagerStats,
  getAttendanceReport,
  getLeaveReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin-stats', authorize('admin'), getAdminStats);
router.get('/manager-stats', authorize('manager', 'admin'), getManagerStats);
router.get('/attendance', authorize('admin'), getAttendanceReport);
router.get('/leaves', authorize('admin'), getLeaveReport);

module.exports = router;

