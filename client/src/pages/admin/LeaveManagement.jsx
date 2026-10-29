import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [comments, setComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (deptFilter && deptFilter !== 'All') params.department = deptFilter;
      if (search) params.search = search;

      const res = await api.get('/leaves/all', { params });
      setLeaves(res.data.leaves);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, deptFilter, search]);

  const handleOpenReview = (leave, defaultStatus = 'approved') => {
    setSelectedLeave(leave);
    setDecision(defaultStatus);
    setComments(defaultStatus === 'approved' ? 'Approved by HR Department' : 'Unable to approve due to team schedule');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setSubmittingReview(true);
      await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: decision,
        reviewComments: comments,
      });

      setToast({ message: `Leave request ${decision} successfully`, type: 'success' });
      setReviewModalOpen(false);
      fetchLeaves();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error reviewing leave', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Company Leave Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, approve, track, and manage employee leave requests organization-wide
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Requests</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase">Pending Approval</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Approved</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-700 uppercase">Rejected</span>
          <p className="text-2xl font-bold text-rose-800 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {['All', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Board Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching leave applications..." />
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No leave requests found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Leave Type</th>
                  <th className="px-6 py-3.5">Requested Dates</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
                          {leave.user?.avatar ? (
                            <img src={leave.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            leave.user?.name?.charAt(0) || 'E'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{leave.user?.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {leave.user?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-3.5 text-slate-700">{leave.user?.department}</td>

                    {/* Leave Type */}
                    <td className="px-6 py-3.5">
                      <span className="capitalize font-semibold text-slate-800">
                        {leave.leaveType}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()} –{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>

                    {/* Days */}
                    <td className="px-6 py-3.5 font-bold text-slate-800">{leave.days} d</td>

                    {/* Reason */}
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <StatusBadge status={leave.status} />
                      {leave.reviewComments && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                          "{leave.reviewComments}"
                        </p>
                      )}
                    </td>

                    {/* Action buttons */}
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
                        <button
                          onClick={() => handleOpenReview(leave, leave.status)}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline"
                        >
                          Modify Decision
                        </button>
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
        title="Process Leave Application"
      >
        {selectedLeave && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-800">
                  {selectedLeave.user?.name} ({selectedLeave.user?.department})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.days} days)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Employee Reason:</span>
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
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
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
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✕ Reject Leave
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Review Comments / Internal Justification
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter feedback or confirmation details..."
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
                {submittingReview ? 'Processing...' : 'Confirm Decision'}
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

