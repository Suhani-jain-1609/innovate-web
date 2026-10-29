const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getManagersList,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/managers/list', getManagersList);
router.get('/', authorize('admin', 'manager'), getEmployees);
router.post('/', authorize('admin'), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', authorize('admin'), updateEmployee);
router.patch('/:id/status', authorize('admin'), toggleEmployeeStatus);

module.exports = router;

