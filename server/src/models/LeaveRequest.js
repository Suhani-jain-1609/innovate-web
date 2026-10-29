const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'annual', 'maternity', 'unpaid'],
      required: [true, 'Please specify leave type'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify end date'],
    },
    days: {
      type: Number,
      required: [true, 'Please specify number of days'],
      min: 0.5,
    },
    reason: {
      type: String,
      required: [true, 'Please specify reason for leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewComments: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);

