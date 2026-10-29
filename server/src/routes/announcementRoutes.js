const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('admin', 'manager'), createAnnouncement);
router.put('/:id', authorize('admin', 'manager'), updateAnnouncement);
router.delete('/:id', authorize('admin', 'manager'), deleteAnnouncement);

module.exports = router;

