const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Department = require('../models/Department');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

// Helper to format date
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get HR Admin Dashboard Statistics
// @route   GET /api/reports/admin-stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departments,
      pendingLeaves,
      todayAttendanceRecords,
      recentAnnouncements,
      recentLeaves,
      recentEmployees,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      Department.find(),
      LeaveRequest.countDocuments({ status: 'pending' }),
      Attendance.find({ date: today }).populate('user', 'department name'),
      Announcement.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name designation'),
      LeaveRequest.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name department employeeId avatar'),
      User.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5).select('name employeeId department designation joiningDate avatar'),
    ]);

    // Calculate attendance status breakdown
    const presentToday = todayAttendanceRecords.filter((a) => a.status === 'present').length;
    const lateToday = todayAttendanceRecords.filter((a) => a.status === 'late').length;
    const halfDayToday = todayAttendanceRecords.filter((a) => a.status === 'half-day').length;
    const checkedInCount = presentToday + lateToday + halfDayToday;
    const absentToday = Math.max(0, activeEmployees - checkedInCount);

    // Active employees on leave today
    const now = new Date();
    const onLeaveCount = await LeaveRequest.countDocuments({
      status: 'approved',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Department breakdown
    const deptStats = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesOnLeave: onLeaveCount,
        pendingLeaveRequests: pendingLeaves,
        totalDepartments: departments.length,
      },
      attendanceToday: {
        date: today,
        totalActive: activeEmployees,
        checkedIn: checkedInCount,
        present: presentToday,
        late: lateToday,
        halfDay: halfDayToday,
        absent: absentToday,
      },
      departmentDistribution: deptStats,
      recentAnnouncements,
      recentLeaves,
      recentEmployees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager Dashboard Statistics
// @route   GET /api/reports/manager-stats
// @access  Private (Manager only)
exports.getManagerStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    // Direct reports
    const teamMembers = await User.find({
      reportingManager: req.user._id,
      status: 'active',
    }).select('name email employeeId department designation avatar');

    const memberIds = teamMembers.map((m) => m._id);

    const [
      teamAttendanceRecords,
      pendingTeamLeaves,
      teamTrainings,
      recentTeamLeaves,
    ] = await Promise.all([
      Attendance.find({ user: { $in: memberIds }, date: today }),
      LeaveRequest.countDocuments({ user: { $in: memberIds }, status: 'pending' }),
      Training.find({
        $or: [
          { createdBy: req.user._id },
          { 'enrolledEmployees.user': { $in: memberIds } },
        ],
      }).sort({ startDate: 1 }).limit(4),
      LeaveRequest.find({ user: { $in: memberIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name employeeId designation avatar'),
    ]);

    const presentToday = teamAttendanceRecords.filter((a) => a.status === 'present').length;
    const lateToday = teamAttendanceRecords.filter((a) => a.status === 'late').length;
    const halfDayToday = teamAttendanceRecords.filter((a) => a.status === 'half-day').length;
    const checkedInCount = presentToday + lateToday + halfDayToday;
    const absentToday = Math.max(0, teamMembers.length - checkedInCount);

    res.status(200).json({
      success: true,
      stats: {
        totalTeamMembers: teamMembers.length,
        presentToday,
        lateToday,
        halfDayToday,
        absentToday,
        pendingLeaves: pendingTeamLeaves,
        upcomingTrainings: teamTrainings.length,
      },
      teamMembers,
      recentLeaves: recentTeamLeaves,
      upcomingTrainings: teamTrainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Exportable Attendance Report (Admin)
// @route   GET /api/reports/attendance
// @access  Private (Admin only)
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    let userFilter = { status: 'active' };
    if (department && department !== 'All') {
      userFilter.department = department;
    }

    const users = await User.find(userFilter).select('name email employeeId department designation');
    const userIds = users.map((u) => u._id);
    matchQuery.user = { $in: userIds };

    const records = await Attendance.find(matchQuery)
      .populate('user', 'name email employeeId department designation')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Exportable Leave Report (Admin)
// @route   GET /api/reports/leaves
// @access  Private (Admin only)
exports.getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, status } = req.query;

    let query = {};
    if (status && status !== 'All') query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    let userFilter = {};
    if (department && department !== 'All') userFilter.department = department;

    if (department && department !== 'All') {
      const users = await User.find(userFilter).select('_id');
      query.user = { $in: users.map((u) => u._id) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate('user', 'name email employeeId department designation')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

