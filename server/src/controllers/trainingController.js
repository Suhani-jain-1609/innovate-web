const Training = require('../models/Training');

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
exports.getTrainings = async (req, res, next) => {
  try {
    const { status, department } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (department && department !== 'All') {
      query.$or = [{ department: 'All' }, { department }];
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email employeeId designation')
      .populate('enrolledEmployees.user', 'name email employeeId designation department avatar')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a training program
// @route   POST /api/trainings
// @access  Private (Admin, Manager)
exports.createTraining = async (req, res, next) => {
  try {
    const { title, description, trainer, department, startDate, endDate, capacity, location } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, trainer, start date, and end date',
      });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      department: department || 'All',
      startDate,
      endDate,
      capacity: capacity || 25,
      location: location || 'Main Conference Room / Virtual',
      status: 'upcoming',
      createdBy: req.user._id,
    });

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email employeeId designation');

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      training: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update training program
// @route   PUT /api/trainings/:id
// @access  Private (Admin, Manager who created)
exports.updateTraining = async (req, res, next) => {
  try {
    const { title, description, trainer, department, startDate, endDate, capacity, location, status } = req.body;

    let training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    if (req.user.role === 'manager' && String(training.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit training programs created by you',
      });
    }

    if (title) training.title = title;
    if (description) training.description = description;
    if (trainer) training.trainer = trainer;
    if (department) training.department = department;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;
    if (capacity) training.capacity = capacity;
    if (location) training.location = location;
    if (status) training.status = status;

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('createdBy', 'name email employeeId designation')
      .populate('enrolledEmployees.user', 'name email employeeId designation department avatar');

    res.status(200).json({
      success: true,
      message: 'Training updated successfully',
      training: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll employee into training (Employee self-enroll or Manager enrolls team member)
// @route   POST /api/trainings/:id/enroll
// @access  Private
exports.enrollTraining = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || req.user._id;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    // Check if already enrolled
    const isEnrolled = training.enrolledEmployees.some(
      (e) => String(e.user) === String(targetUserId)
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already enrolled in this training program',
      });
    }

    if (training.enrolledEmployees.length >= training.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Training session has reached full capacity',
      });
    }

    training.enrolledEmployees.push({
      user: targetUserId,
      status: 'enrolled',
      enrolledAt: new Date(),
    });

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('enrolledEmployees.user', 'name email employeeId designation department avatar');

    res.status(200).json({
      success: true,
      message: 'Enrolled in training successfully',
      training: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee completion status in training
// @route   PATCH /api/trainings/:id/progress
// @access  Private
exports.updateTrainingProgress = async (req, res, next) => {
  try {
    const { userId, status } = req.body; // status: 'in-progress' | 'completed'
    const targetUserId = userId || req.user._id;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const enrollment = training.enrolledEmployees.find(
      (e) => String(e.user) === String(targetUserId)
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Employee is not enrolled in this training',
      });
    }

    enrollment.status = status;
    if (status === 'completed') {
      enrollment.completedAt = new Date();
    }

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('enrolledEmployees.user', 'name email employeeId designation department avatar');

    res.status(200).json({
      success: true,
      message: `Training status updated to ${status}`,
      training: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (Admin, Manager)
exports.deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    if (req.user.role === 'manager' && String(training.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete training programs you created',
      });
    }

    await training.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

