import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Edit2,
  Plus,
} from 'lucide-react';

export const AttendanceManagement = () => {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getToday());
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, late: 0, halfDay: 0, absent: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Manual Attendance Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    userId: '',
    date: getToday(),
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: 'HR manual adjustment',
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [submittingManual, setSubmittingManual] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { date };
      if (department && department !== 'All') params.department = department;
      if (status && status !== 'All') params.status = status;
      if (search) params.search = search;

      const res = await api.get('/attendance/all', { params });
      setRecords(res.data.records);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliary = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees?status=active'),
      ]);
      setDepartments(deptRes.data.departments);
      setEmployeesList(empRes.data.employees);
    } catch (err) {
      console.error('Error fetching depts/emps:', err);
    }
  };

  useEffect(() => {
    fetchAuxiliary();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date, department, status, search]);

  const handleOpenManual = (prefillItem = null) => {
    if (prefillItem) {
      const formatTimeInput = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      };

      setManualForm({
        userId: prefillItem.user._id,
        date,
        checkIn: prefillItem.checkIn ? formatTimeInput(prefillItem.checkIn) : '09:00',
        checkOut: prefillItem.checkOut ? formatTimeInput(prefillItem.checkOut) : '17:30',
        status: prefillItem.status !== 'absent' ? prefillItem.status : 'present',
        notes: prefillItem.attendance?.notes || 'Manual update',
      });
    } else {
      setManualForm({
        userId: employeesList[0]?._id || '',
        date,
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'present',
        notes: 'Manual entry',
      });
    }
    setManualModalOpen(true);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingManual(true);

      // Convert time strings into full Date objects on the chosen date
      let checkInDate = null;
      let checkOutDate = null;
      if (manualForm.checkIn) {
        checkInDate = new Date(`${manualForm.date}T${manualForm.checkIn}:00`);
      }
      if (manualForm.checkOut) {
        checkOutDate = new Date(`${manualForm.date}T${manualForm.checkOut}:00`);
      }

      await api.post('/attendance/manual', {
        userId: manualForm.userId,
        date: manualForm.date,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: manualForm.status,
        notes: manualForm.notes,
      });

      setToast({ message: 'Attendance record updated successfully', type: 'success' });
      setManualModalOpen(false);
      fetchAttendance();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating attendance', type: 'error' });
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Workforce Attendance Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily check-in logs, punctuality metrics, working hours, and manual overrides
          </p>
        </div>

        <button
          onClick={() => handleOpenManual(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Manual Attendance Entry
        </button>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Workforce</span>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{summary.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">On-Time Present</span>
          <p className="text-2xl font-bold text-emerald-800 mt-0.5">{summary.present}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Late Arrivals</span>
          <p className="text-2xl font-bold text-amber-800 mt-0.5">{summary.late}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Half-Day</span>
          <p className="text-2xl font-bold text-purple-800 mt-0.5">{summary.halfDay}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase">Absent / Missing</span>
          <p className="text-2xl font-bold text-rose-800 mt-0.5">{summary.absent}</p>
        </div>
      </div>

      {/* Filter and Date Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Target Date */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Attendance Status</option>
            <option value="present">Present (On-Time)</option>
            <option value="late">Late Arrival</option>
            <option value="half-day">Half Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Compiling attendance roster..." />
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No attendance records found for this date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Check In</th>
                  <th className="px-6 py-3.5">Check Out</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Remarks</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((item) => (
                  <tr key={item.user._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
                          {item.user.avatar ? (
                            <img src={item.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            item.user.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {item.user.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-3.5 text-slate-700">{item.user.department}</td>

                    {/* Check In */}
                    <td className="px-6 py-3.5 font-mono text-slate-800">
                      {item.checkIn
                        ? new Date(item.checkIn).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    {/* Check Out */}
                    <td className="px-6 py-3.5 font-mono text-slate-800">
                      {item.checkOut
                        ? new Date(item.checkOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {item.workHours ? `${item.workHours} hrs` : item.checkIn ? 'In progress' : '0 hrs'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-3.5 text-slate-400 italic">
                      {item.attendance?.notes || (item.status === 'absent' ? 'Not recorded' : 'Standard')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenManual(item)}
                        title="Edit / Override"
                        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Manual Attendance Adjustment"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Employee
            </label>
            <select
              value={manualForm.userId}
              onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
              required
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employeesList.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeId} - {e.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status
              </label>
              <select
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="present">Present (On-Time)</option>
                <option value="late">Late Arrival</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Check In Time
              </label>
              <input
                type="time"
                value={manualForm.checkIn}
                onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Check Out Time
              </label>
              <input
                type="time"
                value={manualForm.checkOut}
                onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Admin Notes / Justification
            </label>
            <textarea
              rows={2}
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              placeholder="e.g. Biometric reader calibration adjustment..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setManualModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingManual}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submittingManual ? 'Saving...' : 'Record Attendance'}
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

