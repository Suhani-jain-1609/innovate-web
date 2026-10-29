import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Megaphone,
} from 'lucide-react';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Review leave modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [comments, setComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/manager-stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching manager stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReview = (leave, defaultStatus = 'approved') => {
    setSelectedLeave(leave);
    setDecision(defaultStatus);
    setComments(defaultStatus === 'approved' ? 'Approved by Team Manager' : 'Team project conflict');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      setSubmittingReview(true);
      await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: decision,
        reviewComments: comments,
      });
      setToast({ message: `Team leave ${decision} successfully`, type: 'success' });
      setReviewModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating leave', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Manager Control Center..." />;
  }

  const { stats, teamMembers, recentLeaves, upcomingTrainings } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
            Team Leadership Hub
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Monitoring {stats?.totalTeamMembers || 0} direct reports in {user?.department}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/manager/leaves"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            Review Team Leaves ({stats?.pendingLeaves || 0})
          </Link>
          <Link
            to="/manager/attendance"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
          >
            Team Attendance Sheet
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Direct Reports"
          value={stats?.totalTeamMembers || 0}
          subtitle="Assigned Team Members"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle={`${stats?.lateToday || 0} Late Check-in`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Pending Leave Approvals"
          value={stats?.pendingLeaves || 0}
          subtitle="Awaiting Your Review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Team Development"
          value={stats?.upcomingTrainings || 0}
          subtitle="Active Training Sessions"
          icon={GraduationCap}
          color="blue"
        />
      </div>

      {/* Team Roster Quick Overview & Upcoming Training */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Direct Reports List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Direct Reports Roster</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff members under your supervision
              </p>
            </div>
            <Link
              to="/manager/team"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Team Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {teamMembers?.map((member) => (
              <div
                key={member._id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-indigo-600">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{member.name}</p>
                    <p className="text-[11px] text-slate-400">{member.designation}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-slate-500 font-semibold block">
                    {member.employeeId}
                  </span>
                  <span className="text-[11px] text-slate-400">{member.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Training Sessions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Team Upskilling
              </h3>
              <Link
                to="/manager/training"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTrainings?.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {item.title}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-[11px] text-slate-500">Trainer: {item.trainer}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enrolled: {item.enrolledEmployees?.length || 0} participants
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/manager/training"
            className="w-full mt-4 py-2 text-center border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors block"
          >
            + Create Team Training Session
          </Link>
        </div>
      </div>

      {/* Pending Team Leave Requests Board */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pending Team Leave Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Leave applications submitted by your direct reports
            </p>
          </div>
          <Link
            to="/manager/leaves"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Team Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeaves?.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No pending leave requests from your team at this moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Team Member</th>
                  <th className="px-6 py-3">Leave Type</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Days</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeaves?.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-indigo-600">
                          {leave.user?.avatar ? (
                            <img src={leave.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            leave.user?.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{leave.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{leave.user?.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 capitalize font-medium">{leave.leaveType}</td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{leave.days} d</td>
                    <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{leave.reason}</td>
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
                        <span className="text-[11px] text-slate-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Team Leave Request"
      >
        {selectedLeave && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-800">{selectedLeave.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.days} d)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Reason:</span>
                <p className="bg-white p-2 rounded-lg border border-slate-200 text-slate-800 italic">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('approved')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    decision === 'approved'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  ✓ Approve Leave
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('rejected')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    decision === 'rejected'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  ✕ Reject Leave
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Manager Remarks / Notes to Employee
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add feedback for your team member..."
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
                disabled={submittingReview}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Save Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

