const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync_db';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany();
    await Department.deleteMany();
    await Attendance.deleteMany();
    await LeaveRequest.deleteMany();
    await Announcement.deleteMany();
    await Training.deleteMany();

    console.log('[Seeder] Cleared existing data.');

    const defaultPassword = 'Password123!';

    // 1. Create Users
    // Admin
    const admin = await User.create({
      employeeId: 'EMP-001',
      name: 'Sarah Jenkins',
      email: 'admin@staffsync.com',
      password: defaultPassword,
      role: 'admin',
      department: 'Human Resources',
      designation: 'Chief People Officer / HR Director',
      joiningDate: new Date('2022-01-15'),
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, San Francisco, CA',
      salary: 135000,
      emergencyContact: {
        name: 'Michael Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 234-9999',
      },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    });

    // Manager 1: Alex Rivera (Engineering)
    const mgrAlex = await User.create({
      employeeId: 'EMP-002',
      name: 'Alex Rivera',
      email: 'alex.manager@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Lead & Tech Manager',
      joiningDate: new Date('2022-05-10'),
      phone: '+1 (555) 345-6789',
      address: '1088 Silicon Way, San Jose, CA',
      salary: 125000,
      reportingManager: admin._id,
      emergencyContact: {
        name: 'Carlos Rivera',
        relationship: 'Brother',
        phone: '+1 (555) 345-1111',
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    });

    // Manager 2: Elena Rostova (Sales & Marketing)
    const mgrElena = await User.create({
      employeeId: 'EMP-003',
      name: 'Elena Rostova',
      email: 'elena.manager@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Sales & Marketing',
      designation: 'VP of Growth & Marketing',
      joiningDate: new Date('2022-08-20'),
      phone: '+1 (555) 456-7890',
      address: '42 Wallaby Way, Oakland, CA',
      salary: 120000,
      reportingManager: admin._id,
      emergencyContact: {
        name: 'Dmitri Rostov',
        relationship: 'Father',
        phone: '+1 (555) 456-2222',
      },
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    });

    // Employees reporting to Alex Rivera (Engineering)
    const empMarcus = await User.create({
      employeeId: 'EMP-004',
      name: 'Marcus Vance',
      email: 'marcus@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: new Date('2023-02-01'),
      reportingManager: mgrAlex._id,
      phone: '+1 (555) 567-8901',
      address: '320 Market Street, San Francisco, CA',
      salary: 95000,
      emergencyContact: {
        name: 'Rachel Vance',
        relationship: 'Partner',
        phone: '+1 (555) 567-3333',
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    });

    const empPriya = await User.create({
      employeeId: 'EMP-005',
      name: 'Priya Sharma',
      email: 'priya@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'UI/UX Frontend Developer',
      joiningDate: new Date('2023-06-15'),
      reportingManager: mgrAlex._id,
      phone: '+1 (555) 678-9012',
      address: '88 Tech Blvd, Mountain View, CA',
      salary: 88000,
      emergencyContact: {
        name: 'Sunita Sharma',
        relationship: 'Mother',
        phone: '+1 (555) 678-4444',
      },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    });

    const empDavid = await User.create({
      employeeId: 'EMP-006',
      name: 'David Kim',
      email: 'david@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Cloud DevOps Architect',
      joiningDate: new Date('2023-09-01'),
      reportingManager: mgrAlex._id,
      phone: '+1 (555) 789-0123',
      address: '500 University Ave, Palo Alto, CA',
      salary: 92000,
      emergencyContact: {
        name: 'Grace Kim',
        relationship: 'Spouse',
        phone: '+1 (555) 789-5555',
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    });

    // Employees reporting to Elena Rostova (Sales & Marketing)
    const empChloe = await User.create({
      employeeId: 'EMP-007',
      name: 'Chloe Bennett',
      email: 'chloe@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Sales & Marketing',
      designation: 'Growth Marketing Strategist',
      joiningDate: new Date('2023-11-10'),
      reportingManager: mgrElena._id,
      phone: '+1 (555) 890-1234',
      address: '150 4th Street, San Francisco, CA',
      salary: 78000,
      emergencyContact: {
        name: 'Laura Bennett',
        relationship: 'Sister',
        phone: '+1 (555) 890-6666',
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    });

    const empJames = await User.create({
      employeeId: 'EMP-008',
      name: 'James Wilson',
      email: 'james@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Sales & Marketing',
      designation: 'Senior Enterprise Account Executive',
      joiningDate: new Date('2024-01-08'),
      reportingManager: mgrElena._id,
      phone: '+1 (555) 901-2345',
      address: '220 Mission St, San Francisco, CA',
      salary: 85000,
      emergencyContact: {
        name: 'Emma Wilson',
        relationship: 'Spouse',
        phone: '+1 (555) 901-7777',
      },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
    });

    // Employee in HR reporting to Sarah Jenkins
    const empAmara = await User.create({
      employeeId: 'EMP-009',
      name: 'Amara Okafor',
      email: 'amara@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Human Resources',
      designation: 'Talent Acquisition & Culture Specialist',
      joiningDate: new Date('2024-03-01'),
      reportingManager: admin._id,
      phone: '+1 (555) 012-3456',
      address: '600 California St, San Francisco, CA',
      salary: 76000,
      emergencyContact: {
        name: 'Obi Okafor',
        relationship: 'Brother',
        phone: '+1 (555) 012-8888',
      },
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=256',
    });

    console.log('[Seeder] Created 9 employees across 3 roles.');

    // 2. Create Departments
    await Department.create([
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development, cloud infrastructure, QA, and technological innovations.',
        head: mgrAlex._id,
        location: 'Level 4, North Tower',
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Employee relations, talent acquisition, payroll, culture, and compliance.',
        head: admin._id,
        location: 'Level 2, Executive Wing',
      },
      {
        name: 'Sales & Marketing',
        code: 'MKT',
        description: 'Brand storytelling, digital advertising, lead generation, and client partnerships.',
        head: mgrElena._id,
        location: 'Level 3, East Wing',
      },
      {
        name: 'Finance & Operations',
        code: 'FIN',
        description: 'Financial planning, accounting, operational budgeting, and risk management.',
        location: 'Level 2, Suite 210',
      },
      {
        name: 'Product & Design',
        code: 'DES',
        description: 'User experience research, UI design, prototyping, and product discovery.',
        location: 'Level 4, Creative Studio',
      },
    ]);

    console.log('[Seeder] Created 5 departments.');

    // 3. Create Attendance Records for the last 5 days
    const allUsers = [admin, mgrAlex, mgrElena, empMarcus, empPriya, empDavid, empChloe, empJames, empAmara];
    const today = new Date();

    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      const dateStr = formatDate(targetDate);

      // Skip weekends
      if (targetDate.getDay() === 0 || targetDate.getDay() === 6) continue;

      for (const u of allUsers) {
        // Today Marcus and Priya are checked in, Chloe is late, James is on leave
        let checkIn = new Date(targetDate);
        let checkOut = new Date(targetDate);
        let status = 'present';
        let workHours = 8.2;

        if (u.email === 'chloe@staffsync.com') {
          checkIn.setHours(9, 45, 0); // Late
          checkOut.setHours(18, 0, 0);
          status = 'late';
          workHours = 8.25;
        } else if (u.email === 'david@staffsync.com' && dayOffset === 1) {
          checkIn.setHours(9, 0, 0);
          checkOut.setHours(13, 0, 0);
          status = 'half-day';
          workHours = 4.0;
        } else {
          checkIn.setHours(8, 55, 0);
          checkOut.setHours(17, 30, 0);
          status = 'present';
          workHours = 8.58;
        }

        // For today, some have not checked out yet
        if (dayOffset === 0) {
          checkOut = null;
          workHours = 0;
        }

        await Attendance.create({
          user: u._id,
          date: dateStr,
          checkIn,
          checkOut,
          status,
          workHours,
          notes: dayOffset === 0 ? 'Checked in via web portal' : 'Regular shift completed',
        });
      }
    }

    console.log('[Seeder] Created attendance records.');

    // 4. Create Leave Requests
    await LeaveRequest.create([
      {
        user: empMarcus._id,
        leaveType: 'annual',
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-14'),
        days: 5,
        reason: 'Annual family vacation to Hawaii.',
        status: 'pending',
      },
      {
        user: empPriya._id,
        leaveType: 'sick',
        startDate: new Date('2026-10-25'),
        endDate: new Date('2026-10-26'),
        days: 2,
        reason: 'Seasonal viral fever recovery.',
        status: 'approved',
        reviewedBy: mgrAlex._id,
        reviewComments: 'Take rest and recover soon. Approved.',
        reviewedAt: new Date('2026-10-25'),
      },
      {
        user: empChloe._id,
        leaveType: 'casual',
        startDate: new Date('2026-11-02'),
        endDate: new Date('2026-11-03'),
        days: 2,
        reason: 'Attending personal family milestone event.',
        status: 'pending',
      },
      {
        user: empDavid._id,
        leaveType: 'casual',
        startDate: new Date('2026-10-18'),
        endDate: new Date('2026-10-19'),
        days: 2,
        reason: 'Home relocation and setup.',
        status: 'approved',
        reviewedBy: mgrAlex._id,
        reviewComments: 'Good luck with the new apartment. Approved.',
        reviewedAt: new Date('2026-10-17'),
      },
      {
        user: empJames._id,
        leaveType: 'annual',
        startDate: new Date('2026-12-22'),
        endDate: new Date('2026-12-31'),
        days: 8,
        reason: 'Winter holidays and New Year celebration.',
        status: 'pending',
      },
      {
        user: empAmara._id,
        leaveType: 'casual',
        startDate: new Date('2026-10-12'),
        endDate: new Date('2026-10-12'),
        days: 1,
        reason: 'Renewing passport and driver license.',
        status: 'approved',
        reviewedBy: admin._id,
        reviewComments: 'Approved by HR Director.',
        reviewedAt: new Date('2026-10-11'),
      },
    ]);

    console.log('[Seeder] Created leave requests.');

    // 5. Create Announcements
    await Announcement.create([
      {
        title: '🚀 StaffSync 2026 All-Hands & Annual Hackathon',
        content: 'We are thrilled to announce our upcoming annual engineering and company hackathon next month. Teams across Engineering, Product, and Marketing can submit their innovative ideas. Exciting prizes and mentorship opportunities await!',
        category: 'event',
        author: admin._id,
        targetDepartment: 'All',
        priority: 'high',
        isPinned: true,
      },
      {
        title: '📋 Comprehensive Health & Wellness Benefits Update',
        content: 'Open enrollment for our revised comprehensive health, dental, and vision insurance policies is now live. Please review the updated plan comparison on the employee portal and select your preferences before November 15th.',
        category: 'policy',
        author: admin._id,
        targetDepartment: 'All',
        priority: 'urgent',
        isPinned: true,
      },
      {
        title: '⚡ Engineering Architecture Sync & AI Integration',
        content: 'Alex Rivera will lead a special knowledge-sharing session this Thursday at 3 PM on integrating generative AI workflows into our continuous deployment pipelines. All engineering team members are invited.',
        category: 'general',
        author: mgrAlex._id,
        targetDepartment: 'Engineering',
        priority: 'normal',
        isPinned: false,
      },
      {
        title: '🎉 Q3 Outstanding Revenue Milestones Achieved',
        content: 'Congratulations to our Sales & Marketing teams for achieving 128% of our quarterly ARR target! Special shoutout to James Wilson and Chloe Bennett for closing key enterprise accounts.',
        category: 'general',
        author: mgrElena._id,
        targetDepartment: 'Sales & Marketing',
        priority: 'normal',
        isPinned: false,
      },
    ]);

    console.log('[Seeder] Created announcements.');

    // 6. Create Training Programs
    await Training.create([
      {
        title: 'Modern Full Stack Mastery: React 19, Node.js & Scalable Architecture',
        description: 'Deep dive into concurrent React 19 paradigms, server components, event-driven Node.js microservices, and high-performance MongoDB indexing patterns.',
        trainer: 'Alex Rivera (Lead Engineer)',
        department: 'Engineering',
        startDate: new Date('2026-11-05'),
        endDate: new Date('2026-11-12'),
        capacity: 20,
        location: 'Virtual Classroom (Teams) / Lab 4B',
        status: 'upcoming',
        createdBy: mgrAlex._id,
        enrolledEmployees: [
          { user: empMarcus._id, status: 'enrolled', enrolledAt: new Date('2026-10-20') },
          { user: empPriya._id, status: 'enrolled', enrolledAt: new Date('2026-10-21') },
          { user: empDavid._id, status: 'enrolled', enrolledAt: new Date('2026-10-22') },
        ],
      },
      {
        title: 'High-Impact Enterprise Leadership & Emotional Intelligence',
        description: 'Strategic leadership program covering executive communication, constructive conflict resolution, empathetic team coaching, and performance management.',
        trainer: 'Dr. Rebecca Vance (Executive Coach)',
        department: 'All',
        startDate: new Date('2026-11-15'),
        endDate: new Date('2026-11-18'),
        capacity: 15,
        location: 'Executive Boardroom & Hybrid Zoom',
        status: 'upcoming',
        createdBy: admin._id,
        enrolledEmployees: [
          { user: mgrAlex._id, status: 'enrolled', enrolledAt: new Date('2026-10-24') },
          { user: mgrElena._id, status: 'enrolled', enrolledAt: new Date('2026-10-24') },
        ],
      },
      {
        title: 'Enterprise Cyber Security & Data Privacy Compliance (GDPR/SOC-2)',
        description: 'Mandatory annual training on data encryption standards, phishing defense mechanisms, SOC-2 compliance protocols, and access credential safety.',
        trainer: 'SecureCloud Academy',
        department: 'All',
        startDate: new Date('2026-10-10'),
        endDate: new Date('2026-10-20'),
        capacity: 100,
        location: 'Self-Paced LMS Module',
        status: 'ongoing',
        createdBy: admin._id,
        enrolledEmployees: [
          { user: empMarcus._id, status: 'completed', enrolledAt: new Date('2026-10-11'), completedAt: new Date('2026-10-15') },
          { user: empPriya._id, status: 'in-progress', enrolledAt: new Date('2026-10-12') },
          { user: empAmara._id, status: 'completed', enrolledAt: new Date('2026-10-11'), completedAt: new Date('2026-10-14') },
        ],
      },
    ]);

    console.log('[Seeder] Created training programs.');
    console.log('[Seeder] ✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

