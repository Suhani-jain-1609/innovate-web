import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

export const EmployeeLeaves = () => {
  const { user, refreshUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Apply leave modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my');
      setLeaves(res.data.leaves);
      setBalances(res.data.balances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  // Recalculate days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const d1 = new Date(formData.startDate);
      const d2 = new Date(formData.endDate);
      if (d2 >= d1) {
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      setToast({ message: 'End date must be on or after start date', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/leaves/apply', formData);
      setToast({ message: 'Leave application submitted for approval', type: 'success' });
      setApplyModalOpen(false);
      setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaveData();
      refreshUser();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error applying for leave', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeBalances = balances || user?.leaveBalances || {
    casual: { total: 12, used: 0 },
    sick: { total: 10, used: 0 },
    annual: { total: 15, used: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Leave Applications & Balances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for paid or unpaid time off, inspect allowance balances, and view approval remarks
          </p>
        </div>

        <button
          onClick={() => setApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Allowance Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Casual */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase">Casual Leave</span>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {activeBalances.casual.total} Days Entitled
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">
              {activeBalances.casual.total - activeBalances.casual.used}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Used: {activeBalances.casual.used} days</span>
            <span className="font-semibold text-indigo-600">
              {Math.round(
                ((activeBalances.casual.total - activeBalances.casual.used) /
                  activeBalances.casual.total) *
                  100
              )}
              % left
            </span>
          </div>
        </div>

        {/* Sick */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Sick Leave</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {activeBalances.sick.total} Days Entitled
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">
              {activeBalances.sick.total - activeBalances.sick.used}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Used: {activeBalances.sick.used} days</span>
            <span className="font-semibold text-emerald-600">
              {Math.round(
                ((activeBalances.sick.total - activeBalances.sick.used) /
                  activeBalances.sick.total) *
                  100
              )}
              % left
            </span>
          </div>
        </div>

        {/* Annual */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Annual Vacation</span>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {activeBalances.annual.total} Days Entitled
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">
              {activeBalances.annual.total - activeBalances.annual.used}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Used: {activeBalances.annual.used} days</span>
            <span className="font-semibold text-amber-600">
              {Math.round(
                ((activeBalances.annual.total - activeBalances.annual.used) /
                  activeBalances.annual.total) *
                  100
              )}
              % left
            </span>
          </div>
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Your Leave Application History</h3>
          <span className="text-xs text-slate-400">{leaves.length} Applications Total</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving leave records..." />
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            You have not submitted any leave applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Dates Requested</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reviewed By</th>
                  <th className="px-6 py-3.5">Supervisor Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-bold text-slate-800 capitalize">
                      {item.leaveType}
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {new Date(item.startDate).toLocaleDateString()} to{' '}
                      {new Date(item.endDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-3.5 font-black text-slate-800">{item.days} d</td>

                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-3.5 text-slate-700">
                      {item.reviewedBy ? item.reviewedBy.name : '—'}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500 italic max-w-xs truncate">
                      {item.reviewComments || 'Pending review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Time Off"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Leave Type
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="casual">
                Casual Leave ({activeBalances.casual.total - activeBalances.casual.used} days left)
              </option>
              <option value="sick">
                Sick Leave ({activeBalances.sick.total - activeBalances.sick.used} days left)
              </option>
              <option value="annual">
                Annual Vacation ({activeBalances.annual.total - activeBalances.annual.used} days left)
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
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold flex items-center justify-between">
              <span>Total Leave Duration:</span>
              <span>{calculatedDays} Day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Reason for Absence
            </label>
            <textarea
              rows={3}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="State reason clearly for manager approval..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
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

