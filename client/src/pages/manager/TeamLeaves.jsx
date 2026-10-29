import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

export const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [comments, setComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTeamLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/leaves/team', { params });
      setLeaves(res.data.leaves);
    } catch (err) {
      console.error('Error fetching team leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, [statusFilter]);

  const handleOpenReview = (leave, defaultStatus = 'approved') => {
    setSelectedLeave(leave);
    setDecision(defaultStatus);
    setComments(defaultStatus === 'approved' ? 'Approved by Team Manager' : 'Project deliverables conflict');
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
      setToast({ message: `Leave request ${decision} successfully`, type: 'success' });
      setReviewModalOpen(false);
      fetchTeamLeaves();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating leave', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Team Leave Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review time-off requests submitted by your team members and provide management feedback
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600 shadow-xs">
          {['All', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving team leave submissions..." />
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No leave requests found under the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Team Member</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Dates Requested</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Employee Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
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
                    <td className="px-6 py-3.5 capitalize font-semibold text-slate-800">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{leave.days} d</td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
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
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Leave Application"
      >
        {selectedLeave && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-800">{selectedLeave.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.days} days)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Reason:</span>
                <p className="bg-white p-2 rounded-lg border border-slate-200 text-slate-800 italic">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Decision
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
                  ✓ Approve
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
                  ✕ Reject
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Manager comments..."
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
                {submittingReview ? 'Submitting...' : 'Confirm'}
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

