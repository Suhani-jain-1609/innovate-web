import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Clock,
  CalendarCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Megaphone,
  User,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveData, setLeaveData] = useState({ balances: null, leaves: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Apply leave modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Live time for the widget
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, leaveRes, annRes, trainRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/leaves/my'),
        api.get('/announcements'),
        api.get('/trainings'),
      ]);

      setTodayAttendance(attRes.data.attendance);
      setLeaveData({ balances: leaveRes.data.balances, leaves: leaveRes.data.leaves });
      setAnnouncements(annRes.data.announcements);
      setTrainings(trainRes.data.trainings);
    } catch (err) {
      console.error('Error fetching employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in');
      setTodayAttendance(res.data.attendance);
      setToast({ message: res.data.message, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error checking in', type: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      setTodayAttendance(res.data.attendance);
      setToast({ message: res.data.message, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error checking out', type: 'error' });
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLeave(true);
      await api.post('/leaves/apply', leaveForm);
      setToast({ message: 'Leave application submitted successfully', type: 'success' });
      setLeaveModalOpen(false);
      setLeaveForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchData();
      refreshUser();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error applying for leave', type: 'error' });
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Helper for greeting based on hour
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <LoadingSpinner text="Preparing your employee workspace..." />;
  }

  const balances = leaveData.balances || user?.leaveBalances || {
    casual: { total: 12, used: 0 },
    sick: { total: 10, used: 0 },
    annual: { total: 15, used: 0 },
  };

  // Mock upcoming company holidays for the calendar widget
  const upcomingHolidays = [
    { title: 'Thanksgiving Day', date: 'Thu, Nov 26, 2026', type: 'National Holiday' },
    { title: 'Christmas Eve & Day', date: 'Dec 24 - 25, 2026', type: 'Corporate Holiday' },
    { title: "New Year's Day", date: 'Fri, Jan 01, 2027', type: 'Public Holiday' },
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              StaffSync Employee Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            {user?.designation} • {user?.department} Department • ID: {user?.employeeId}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-indigo-50 transition-all"
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            Apply for Leave
          </button>
          <Link
            to="/employee/profile"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/15 transition-all"
          >
            <User className="w-4 h-4" />
            My Profile
          </Link>
        </div>
      </div>

      {/* Grid: Attendance Quick Clock & Leave Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Attendance Punch Clock Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Today's Attendance
              </span>
              {todayAttendance && <StatusBadge status={todayAttendance.status} />}
            </div>

            <div className="my-4 text-center">
              <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs mb-4">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Clock In:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {todayAttendance?.checkIn
                    ? new Date(todayAttendance.checkIn).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not checked in yet'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Clock Out:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {todayAttendance?.checkOut
                    ? new Date(todayAttendance.checkOut).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : todayAttendance?.checkIn
                    ? 'Currently on shift'
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-indigo-600">
                  {todayAttendance?.workHours
                    ? `${todayAttendance.workHours} hrs`
                    : todayAttendance?.checkIn
                    ? 'Active'
                    : '0 hrs'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                todayAttendance?.checkIn
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              {todayAttendance?.checkIn ? '✓ Checked In' : 'Check In Now'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                !todayAttendance?.checkIn || todayAttendance?.checkOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
              }`}
            >
              {todayAttendance?.checkOut ? '✓ Completed' : 'Check Out'}
            </button>
          </div>
        </div>

        {/* Leave Balances Grid (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Annual Leave Allowances</h3>
                <p className="text-xs text-slate-400 mt-0.5">Accrued time-off balances for 2026</p>
              </div>
              <Link
                to="/employee/leaves"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Leave History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
              {/* Casual */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase">
                  Casual Leave
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-indigo-900">
                    {balances.casual.total - balances.casual.used}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium">
                    / {balances.casual.total} days left
                  </span>
                </div>
                <div className="w-full h-1.5 bg-indigo-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{
                      width: `${(balances.casual.used / balances.casual.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Sick */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">
                  Sick Leave
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-emerald-900">
                    {balances.sick.total - balances.sick.used}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">
                    / {balances.sick.total} days left
                  </span>
                </div>
                <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{
                      width: `${(balances.sick.used / balances.sick.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Annual */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[11px] font-bold text-amber-700 uppercase">
                  Annual Vacation
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-amber-900">
                    {balances.annual.total - balances.annual.used}
                  </span>
                  <span className="text-xs text-amber-600 font-medium">
                    / {balances.annual.total} days left
                  </span>
                </div>
                <div className="w-full h-1.5 bg-amber-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{
                      width: `${(balances.annual.used / balances.annual.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Total Leaves Taken: {balances.casual.used + balances.sick.used + balances.annual.used}{' '}
              days
            </span>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + Submit Leave Request
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leave Status & Company Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                Recent Leave Submissions
              </h3>
              <Link
                to="/employee/leaves"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>

            {leaveData.leaves.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No leave requests filed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {leaveData.leaves.slice(0, 3).map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 capitalize">
                          {leave.leaveType} Leave
                        </span>
                        <span className="text-slate-400 font-mono">({leave.days} d)</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {new Date(leave.startDate).toLocaleDateString()} to{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge status={leave.status} />
                      {leave.reviewComments && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-[140px] truncate">
                          "{leave.reviewComments}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setLeaveModalOpen(true)}
            className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            + Apply for Time Off
          </button>
        </div>

        {/* Company Announcements Carousel / Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Latest Announcements
              </h3>
              <Link
                to="/employee/announcements"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All Bulletins
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-xs line-clamp-1">
                      {item.title}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Synced with HR Communications</span>
            <Link
              to="/employee/announcements"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Browse all &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays & Available Training Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holidays */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Upcoming Company Holidays
          </h3>
          <div className="space-y-3 text-xs">
            {upcomingHolidays.map((holiday, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">{holiday.title}</p>
                  <p className="text-[11px] text-slate-400">{holiday.type}</p>
                </div>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {holiday.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Training Programs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Featured Development Programs
              </h3>
              <Link
                to="/employee/training"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View Catalog
              </Link>
            </div>

            <div className="space-y-3">
              {trainings.slice(0, 2).map((t) => (
                <div
                  key={t._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <h4 className="font-bold text-slate-800 text-xs mb-1">{t.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-2">Trainer: {t.trainer}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {new Date(t.startDate).toLocaleDateString()} –{' '}
                      {new Date(t.endDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-indigo-600">{t.capacity} seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/employee/training"
            className="w-full mt-4 py-2 text-center border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors block"
          >
            Explore All Training Sessions
          </Link>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Apply for Time Off"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Leave Category
            </label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="casual">
                Casual Leave ({balances.casual.total - balances.casual.used} days left)
              </option>
              <option value="sick">
                Sick Leave ({balances.sick.total - balances.sick.used} days left)
              </option>
              <option value="annual">
                Annual Vacation ({balances.annual.total - balances.annual.used} days left)
              </option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Reason for Absence
            </label>
            <textarea
              rows={3}
              required
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State the purpose of your time-off..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingLeave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submittingLeave ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

