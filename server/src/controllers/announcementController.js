const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    // Role-based visibility: employees see 'All' or their department
    if (req.user.role === 'employee') {
      query.$or = [
        { targetDepartment: 'All' },
        { targetDepartment: req.user.department },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email employeeId role designation avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin, Manager)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, targetDepartment, priority, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'general',
      targetDepartment: targetDepartment || 'All',
      priority: priority || 'normal',
      isPinned: isPinned || false,
      author: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name email employeeId role designation avatar');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin or Author)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, targetDepartment, priority, isPinned } = req.body;

    let announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && String(announcement.author) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this announcement',
      });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (targetDepartment) announcement.targetDepartment = targetDepartment;
    if (priority) announcement.priority = priority;
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate('author', 'name email employeeId role designation avatar');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin or Author)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (req.user.role !== 'admin' && String(announcement.author) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement',
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

