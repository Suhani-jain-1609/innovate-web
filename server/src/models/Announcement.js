const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an announcement title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'policy', 'event', 'urgent'],
      default: 'general',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetDepartment: {
      type: String,
      default: 'All',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);

