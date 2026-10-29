const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide training description'],
      trim: true,
    },
    trainer: {
      type: String,
      required: [true, 'Please specify trainer name/organization'],
      trim: true,
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    capacity: {
      type: Number,
      default: 25,
    },
    location: {
      type: String,
      default: 'Main Training Room / Remote (Teams)',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    enrolledEmployees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['enrolled', 'in-progress', 'completed'],
          default: 'enrolled',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);

