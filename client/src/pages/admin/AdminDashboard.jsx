import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, RoleBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  Building2,
  Megaphone,
  UserPlus,
  PlusCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Review leave modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [processingReview, setProcessingReview] = useState(false);

  // Quick announcement modal state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general',
    targetDepartment: 'All',
    priority: 'normal',
    isPinned: false,
  });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/admin-stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReview = (leave, defaultDecision = 'approved') => {
    setSelectedLeave(leave);
    setReviewStatus(defaultDecision);
    setReviewComments(defaultDecision === 'approved' ? 'Approved by HR Admin' : 'Leave request rejected');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      setProcessingReview(true);
      await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: reviewStatus,
        reviewComments,
      });
      setToast({ message: `Leave marked as ${reviewStatus} successfully`, type: 'success' });
      setReviewModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating leave', type: 'error' });
    } finally {
      setProcessingReview(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAnnouncement(true);
      await api.post('/announcements', newAnnouncement);
      setToast({ message: 'Announcement published successfully', type: 'success' });
      setAnnouncementModalOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        targetDepartment: 'All',
        priority: 'normal',
        isPinned: false,
      });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating announcement', type: 'error' });
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading StaffSync HR Dashboard..." />;
  }

  const { stats, attendanceToday, departmentDistribution, recentLeaves, recentAnnouncements } =
    data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            HR Operations Control
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Organization Overview</h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time workforce health, attendance logs, and operational workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/employees"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Link>
          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
          >
            <Megaphone className="w-4 h-4 text-indigo-300" />
            Post Announcement
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={stats?.totalEmployees || 0}
          subtitle={`${stats?.activeEmployees || 0} Active Staff`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={attendanceToday?.checkedIn || 0}
          subtitle={`${attendanceToday?.late || 0} Late Check-ins`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="On Leave Today"
          value={stats?.employeesOnLeave || 0}
          subtitle="Approved Absences"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaveRequests || 0}
          subtitle="Action Required"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Today's Attendance Real-Time Status & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Today's Attendance</h3>
                <p className="text-xs text-slate-400 mt-0.5">{attendanceToday?.date}</p>
              </div>
              <Link
                to="/admin/attendance"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Detailed Log <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase">On-Time</span>
                <p className="text-2xl font-bold text-emerald-800 mt-0.5">
                  {attendanceToday?.present || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 uppercase">Late Arrivals</span>
                <p className="text-2xl font-bold text-amber-800 mt-0.5">{attendanceToday?.late || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-[11px] font-semibold text-purple-700 uppercase">Half Day</span>
                <p className="text-2xl font-bold text-purple-800 mt-0.5">
                  {attendanceToday?.halfDay || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-700 uppercase">Absent / Unreported</span>
                <p className="text-2xl font-bold text-rose-800 mt-0.5">
                  {attendanceToday?.absent || 0}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>Overall Presence Rate</span>
              <span className="font-bold text-slate-800">
                {stats?.activeEmployees
                  ? Math.round(((attendanceToday?.checkedIn || 0) / stats.activeEmployees) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{
                  width: `${
                    stats?.activeEmployees
                      ? ((attendanceToday?.present || 0) / stats.activeEmployees) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{
                  width: `${
                    stats?.activeEmployees
                      ? ((attendanceToday?.late || 0) / stats.activeEmployees) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="bg-purple-400 h-full"
                style={{
                  width: `${
                    stats?.activeEmployees
                      ? ((attendanceToday?.halfDay || 0) / stats.activeEmployees) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Department Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Active Headcount Breakdown</p>
              </div>
              <Link
                to="/admin/departments"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {departmentDistribution?.map((dept) => {
                const percentage = stats?.activeEmployees
                  ? Math.round((dept.count / stats.activeEmployees) * 100)
                  : 0;
                return (
                  <div key={dept._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{dept._id}</span>
                      <span className="text-slate-500 font-medium">
                        {dept.count} members ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Units: {stats?.totalDepartments || 0}</span>
            <span className="text-indigo-600 font-medium">Synced with directory</span>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Latest Announcements
              </h3>
              <Link
                to="/admin/announcements"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentAnnouncements?.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {item.title}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="w-full mt-4 py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            + Broadcast Announcement
          </button>
        </div>
      </div>

      {/* Pending Leave Requests Quick Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Leave Applications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and act on pending workforce requests
            </p>
          </div>
          <Link
            to="/admin/leaves"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Full Requests Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Leave Type</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLeaves?.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-indigo-600">
                        {leave.user?.avatar ? (
                          <img
                            src={leave.user.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          leave.user?.name?.charAt(0) || 'E'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{leave.user?.name}</p>
                        <p className="text-[11px] text-slate-400">{leave.user?.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{leave.user?.department}</td>
                  <td className="px-6 py-3.5 font-medium capitalize text-slate-700">
                    {leave.leaveType}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-800">{leave.days} d</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReview(leave, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReview(leave, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Leave Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Leave Application"
      >
        {selectedLeave && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Applicant:</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedLeave.user?.name} ({selectedLeave.user?.employeeId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Leave Type & Days:</span>
                <span className="text-xs font-semibold capitalize text-indigo-600">
                  {selectedLeave.leaveType} ({selectedLeave.days} day(s))
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Dates:</span>
                <span className="text-xs text-slate-700">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Reason:</span>
                <p className="text-xs italic text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('approved')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    reviewStatus === 'approved'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✓ Approve Leave
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus('rejected')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    reviewStatus === 'rejected'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✕ Reject Leave
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Administrative Comments / Notes
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={3}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Provide notes or justification..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingReview}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
              >
                {processingReview ? 'Submitting...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Company Announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
              }
              placeholder="e.g. Office Relocation & Facilities Update"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={newAnnouncement.category}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, category: e.target.value })
                }
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Target Audience
              </label>
              <select
                value={newAnnouncement.targetDepartment}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, targetDepartment: e.target.value })
                }
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Operations">Finance & Operations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Priority
            </label>
            <select
              value={newAnnouncement.priority}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })
              }
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Announcement Message
            </label>
            <textarea
              required
              rows={4}
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
              }
              placeholder="Write the full announcement body..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={newAnnouncement.isPinned}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pinnedCheck" className="text-xs font-medium text-slate-700">
              Pin to top of announcement feed
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAnnouncementModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAnnouncement}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submittingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
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

