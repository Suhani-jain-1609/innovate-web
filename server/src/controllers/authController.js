const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'staffsync_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new employee/user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, employeeId, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Auto generate employeeId if not provided
    let empId = employeeId;
    if (!empId) {
      const count = await User.countDocuments();
      empId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'employee',
      department: department || 'General',
      designation: designation || 'Associate',
      employeeId: empId,
      phone: phone || '',
    });

    const token = generateToken(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact HR.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('reportingManager', 'name email employeeId designation department avatar');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, address, emergencyContact, avatar, name } = req.body;

    const updateFields = {};
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (name && req.user.role === 'admin') updateFields.name = name;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('reportingManager', 'name email employeeId designation department');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password (public / self-service for demo & recovery)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and new password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

