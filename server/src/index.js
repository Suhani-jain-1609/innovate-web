const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'StaffSync HRMS API',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Custom Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[StaffSync API] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[StaffSync API Error] ${err.message}`);
});

