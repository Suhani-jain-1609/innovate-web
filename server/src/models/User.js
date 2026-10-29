const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide employee email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee',
    },
    department: {
      type: String,
      default: 'General',
    },
    designation: {
      type: String,
      default: 'Staff Member',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    salary: {
      type: Number,
      default: 50000,
    },
    leaveBalances: {
      casual: {
        total: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
      },
      sick: {
        total: { type: Number, default: 10 },
        used: { type: Number, default: 0 },
      },
      annual: {
        total: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
      },
      maternity: {
        total: { type: Number, default: 90 },
        used: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
