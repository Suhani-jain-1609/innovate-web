const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/team', authorize('manager', 'admin'), getTeamLeaves);
router.get('/all', authorize('admin'), getAllLeaves);
router.put('/:id/review', authorize('manager', 'admin'), reviewLeave);

module.exports = router;

