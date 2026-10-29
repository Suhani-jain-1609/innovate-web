const User = require('../models/User');

// @desc    Get all employees (Admin: all, Manager: direct reports)
// @route   GET /api/employees
// @access  Private (Admin, Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    const { search, department, role, status } = req.query;
    let query = {};

    // Scoping for Manager: ONLY see direct reports
    if (req.user.role === 'manager') {
      query.reportingManager = req.user._id;
    }

    // Role filter (Admin only)
    if (role && req.user.role === 'admin') {
      query.role = role;
    }

    // Department filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search by name, email, or employeeId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(query)
      .populate('reportingManager', 'name email employeeId designation department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate('reportingManager', 'name email employeeId designation department avatar');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Role permission check
    if (
      req.user.role === 'manager' &&
      String(employee.reportingManager?._id) !== String(req.user._id) &&
      String(employee._id) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view members of your own team',
      });
    }

    if (req.user.role === 'employee' && String(employee._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other employee details',
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee record
// @route   POST /api/employees
// @access  Private (Admin only)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      employeeId,
      joiningDate,
      reportingManager,
      phone,
      address,
      salary,
      emergencyContact,
    } = req.body;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    let empId = employeeId;
    if (!empId) {
      const count = await User.countDocuments();
      empId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const existingId = await User.findOne({ employeeId: empId });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID ${empId} is already in use`,
      });
    }

    const newEmployee = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Welcome@123',
      role: role || 'employee',
      department: department || 'General',
      designation: designation || 'Associate',
      employeeId: empId,
      joiningDate: joiningDate || Date.now(),
      reportingManager: reportingManager || null,
      phone: phone || '',
      address: address || '',
      salary: salary || 50000,
      emergencyContact: emergencyContact || {},
      status: 'active',
    });

    const populatedEmployee = await User.findById(newEmployee._id)
      .populate('reportingManager', 'name email employeeId designation');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: populatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee record
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
exports.updateEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      role,
      department,
      designation,
      employeeId,
      joiningDate,
      reportingManager,
      phone,
      address,
      salary,
      status,
      leaveBalances,
    } = req.body;

    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Email collision check
    if (email && email.toLowerCase() !== employee.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address already assigned to another user',
        });
      }
      employee.email = email.toLowerCase();
    }

    // EmployeeId collision check
    if (employeeId && employeeId !== employee.employeeId) {
      const idExists = await User.findOne({ employeeId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is already in use',
        });
      }
      employee.employeeId = employeeId;
    }

    if (name) employee.name = name;
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (joiningDate) employee.joiningDate = joiningDate;
    if (reportingManager !== undefined) employee.reportingManager = reportingManager || null;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (salary !== undefined) employee.salary = salary;
    if (status) employee.status = status;
    if (leaveBalances) employee.leaveBalances = { ...employee.leaveBalances, ...leaveBalances };

    // Update password if specified
    if (req.body.password && req.body.password.trim().length >= 6) {
      employee.password = req.body.password;
    }

    await employee.save();

    const updated = await User.findById(employee._id)
      .populate('reportingManager', 'name email employeeId designation department');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle status / deactivate employee
// @route   PATCH /api/employees/:id/status
// @access  Private (Admin only)
exports.toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee marked as ${employee.status}`,
      status: employee.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of managers for dropdowns
// @route   GET /api/employees/managers/list
// @access  Private
exports.getManagersList = async (req, res, next) => {
  try {
    const managers = await User.find({
      role: { $in: ['admin', 'manager'] },
      status: 'active',
    }).select('name email employeeId designation department');

    res.status(200).json({
      success: true,
      managers,
    });
  } catch (error) {
    next(error);
  }
};

