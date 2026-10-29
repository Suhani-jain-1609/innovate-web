const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments with active employee count
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email employeeId designation avatar')
      .sort({ name: 1 });

    // Count employees per department
    const employeeCounts = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    employeeCounts.forEach((item) => {
      countMap.set(item._id, item.count);
    });

    const enrichedDepartments = departments.map((dept) => {
      const obj = dept.toObject();
      obj.employeeCount = countMap.get(dept.name) || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      departments: enrichedDepartments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin only)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head, location } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required',
      });
    }

    const existingName = await Department.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists',
      });
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists',
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      head: head || null,
      location: location || 'Main Office',
    });

    const populatedDept = await Department.findById(department._id)
      .populate('head', 'name email employeeId designation');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: populatedDept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head, location } = req.body;

    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;
    if (location !== undefined) department.location = location;

    await department.save();

    const updated = await Department.findById(department._id)
      .populate('head', 'name email employeeId designation avatar');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if any employees belong to this department
    const empCount = await User.countDocuments({ department: department.name, status: 'active' });
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${empCount} active employee(s) assigned to ${department.name}. Please reassign them first.`,
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

