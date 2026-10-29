const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to format date to YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Check-in today
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    let record = await Attendance.findOne({ user: req.user._id, date: today });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today',
        attendance: record,
      });
    }

    // Determine status (Late if checked in after 9:30 AM local)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let status = 'present';
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = 'late';
    }

    if (!record) {
      record = new Attendance({
        user: req.user._id,
        date: today,
        checkIn: now,
        status,
      });
    } else {
      record.checkIn = now;
      record.status = status;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked in successfully as ${status}`,
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out today
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    const record = await Attendance.findOne({ user: req.user._id, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in before checking out',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today',
        attendance: record,
      });
    }

    record.checkOut = now;

    // Calculate duration in hours
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hoursWorked = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.workHours = hoursWorked;

    if (hoursWorked < 4 && record.status !== 'late') {
      record.status = 'half-day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Logged ${hoursWorked} hours today.`,
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance status today
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ user: req.user._id, date: today });

    res.status(200).json({
      success: true,
      attendance: record || null,
      date: today,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = { user: req.user._id };

    if (month && year) {
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      query.date = { $regex: `^${monthPrefix}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    // Summary calculations
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const halfDayCount = records.filter((r) => r.status === 'half-day').length;
    const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);

    res.status(200).json({
      success: true,
      records,
      summary: {
        totalDays: records.length,
        present: presentCount,
        late: lateCount,
        halfDay: halfDayCount,
        totalHours: Number(totalHours.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team attendance for Manager
// @route   GET /api/attendance/team
// @access  Private (Manager, Admin)
exports.getTeamAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || getTodayDateString();

    // Find direct reports
    const teamMembers = await User.find({
      reportingManager: req.user._id,
      status: 'active',
    }).select('name email employeeId designation department avatar');

    const memberIds = teamMembers.map((m) => m._id);

    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      user: { $in: memberIds },
      date: targetDate,
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(String(att.user), att);
    });

    // Merge team members with attendance info
    const teamStatus = teamMembers.map((member) => {
      const att = attendanceMap.get(String(member._id));
      return {
        member,
        attendance: att || null,
        status: att ? att.status : 'absent',
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate,
      teamStatus,
      summary: {
        totalTeam: teamMembers.length,
        present: teamStatus.filter((t) => t.status === 'present').length,
        late: teamStatus.filter((t) => t.status === 'late').length,
        halfDay: teamStatus.filter((t) => t.status === 'half-day').length,
        absent: teamStatus.filter((t) => t.status === 'absent').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance (HR Admin)
// @route   GET /api/attendance/all
// @access  Private (Admin only)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status, search } = req.query;
    const targetDate = date || getTodayDateString();

    let userQuery = { status: 'active' };
    if (department && department !== 'All') {
      userQuery.department = department;
    }
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(userQuery).select(
      'name email employeeId designation department avatar'
    );
    const empIds = employees.map((e) => e._id);

    let attQuery = {
      date: targetDate,
      user: { $in: empIds },
    };
    if (status && status !== 'All') {
      attQuery.status = status;
    }

    const attendanceRecords = await Attendance.find(attQuery).populate(
      'user',
      'name email employeeId designation department avatar'
    );

    const recordMap = new Map();
    attendanceRecords.forEach((r) => {
      if (r.user) recordMap.set(String(r.user._id), r);
    });

    const combinedList = employees.map((emp) => {
      const att = recordMap.get(String(emp._id));
      return {
        user: emp,
        attendance: att || null,
        status: att ? att.status : 'absent',
        checkIn: att?.checkIn || null,
        checkOut: att?.checkOut || null,
        workHours: att?.workHours || 0,
      };
    });

    const filteredList =
      status && status !== 'All'
        ? combinedList.filter((item) => item.status === status)
        : combinedList;

    res.status(200).json({
      success: true,
      date: targetDate,
      records: filteredList,
      summary: {
        total: employees.length,
        present: combinedList.filter((c) => c.status === 'present').length,
        late: combinedList.filter((c) => c.status === 'late').length,
        halfDay: combinedList.filter((c) => c.status === 'half-day').length,
        absent: combinedList.filter((c) => c.status === 'absent').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manual mark/update attendance
// @route   POST /api/attendance/manual
// @access  Private (Admin only)
exports.markAttendanceAdmin = async (req, res, next) => {
  try {
    const { userId, date, checkIn, checkOut, status, notes } = req.body;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and date',
      });
    }

    let workHours = 0;
    if (checkIn && checkOut) {
      const diffMs = new Date(checkOut) - new Date(checkIn);
      workHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    const record = await Attendance.findOneAndUpdate(
      { user: userId, date },
      {
        user: userId,
        date,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        status: status || 'present',
        workHours,
        notes: notes || 'Admin updated',
      },
      { upsert: true, new: true }
    ).populate('user', 'name employeeId department designation');

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

