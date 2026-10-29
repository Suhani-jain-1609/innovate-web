const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  markAttendanceAdmin,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my', getMyAttendance);
router.get('/team', authorize('manager', 'admin'), getTeamAttendance);
router.get('/all', authorize('admin'), getAllAttendance);
router.post('/manual', authorize('admin'), markAttendanceAdmin);

module.exports = router;

