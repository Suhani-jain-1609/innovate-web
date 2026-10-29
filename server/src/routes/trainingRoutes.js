const express = require('express');
const router = express.Router();
const {
  getTrainings,
  createTraining,
  updateTraining,
  enrollTraining,
  updateTrainingProgress,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTrainings);
router.post('/', authorize('admin', 'manager'), createTraining);
router.put('/:id', authorize('admin', 'manager'), updateTraining);
router.post('/:id/enroll', enrollTraining);
router.patch('/:id/progress', updateTrainingProgress);
router.delete('/:id', authorize('admin', 'manager'), deleteTraining);

module.exports = router;

