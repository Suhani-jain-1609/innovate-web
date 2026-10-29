const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Helper to calculate days between two dates inclusive
const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    const days = calculateDays(startDate, endDate);

    // Check employee's current leave balance if applicable
    const user = await User.findById(req.user._id);
    if (user.leaveBalances && user.leaveBalances[leaveType]) {
      const balance = user.leaveBalances[leaveType];
      const remaining = balance.total - balance.used;
      if (remaining < days && leaveType !== 'unpaid') {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Remaining: ${remaining} day(s), Requested: ${days} day(s).`,
        });
      }
    }

    const leave = await LeaveRequest.create({
      user: req.user._id,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
    });

    const populatedLeave = await LeaveRequest.findById(leave._id)
      .populate('user', 'name email employeeId department designation');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populatedLeave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's leave requests & balances
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id })
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user._id).select('leaveBalances');

    res.status(200).json({
      success: true,
      balances: user.leaveBalances,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave requests for Manager's direct reports
// @route   GET /api/leaves/team
// @access  Private (Manager, Admin)
exports.getTeamLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Find direct reports
    const teamMembers = await User.find({
      reportingManager: req.user._id,
    }).select('_id');

    const memberIds = teamMembers.map((m) => m._id);

    let query = { user: { $in: memberIds } };
    if (status && status !== 'All') {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('user', 'name email employeeId department designation avatar')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
      pendingCount: leaves.filter((l) => l.status === 'pending').length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all company leave requests (HR Admin)
// @route   GET /api/leaves/all
// @access  Private (Admin only)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    let userFilter = {};
    if (department && department !== 'All') {
      userFilter.department = department;
    }
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All' || search) {
      const matchedUsers = await User.find(userFilter).select('_id');
      query.user = { $in: matchedUsers.map((u) => u._id) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate('user', 'name email employeeId department designation avatar')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    const totalCount = leaves.length;
    const pendingCount = leaves.filter((l) => l.status === 'pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'approved').length;
    const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

    res.status(200).json({
      success: true,
      leaves,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review / approve or reject leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager, Admin)
exports.reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Role check for Manager: must be reporting manager of the user
    if (req.user.role === 'manager') {
      if (
        !leave.user.reportingManager ||
        String(leave.user.reportingManager) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only review leave requests of your team members',
        });
      }
    }

    const previousStatus = leave.status;
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComments = reviewComments || (status === 'approved' ? 'Approved by supervisor' : 'Rejected by supervisor');
    leave.reviewedAt = new Date();

    await leave.save();

    // If status became approved and wasn't approved before, update user's leave balance
    if (status === 'approved' && previousStatus !== 'approved') {
      const user = await User.findById(leave.user._id);
      if (user && user.leaveBalances && user.leaveBalances[leave.leaveType]) {
        user.leaveBalances[leave.leaveType].used += leave.days;
        await user.save();
      }
    }

    // If previously approved was reverted to rejected, refund the balance
    if (previousStatus === 'approved' && status === 'rejected') {
      const user = await User.findById(leave.user._id);
      if (user && user.leaveBalances && user.leaveBalances[leave.leaveType]) {
        user.leaveBalances[leave.leaveType].used = Math.max(
          0,
          user.leaveBalances[leave.leaveType].used - leave.days
        );
        await user.save();
      }
    }

    const updatedLeave = await LeaveRequest.findById(leave._id)
      .populate('user', 'name email employeeId department designation avatar')
      .populate('reviewedBy', 'name designation');

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};

