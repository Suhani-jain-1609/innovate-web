import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Filter,
} from 'lucide-react';

export const EmployeeAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalDays: 0, present: 0, late: 0, halfDay: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Month and Year filter
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [todayRes, myRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my', { params: { month, year } }),
      ]);
      setTodayAttendance(todayRes.data.attendance);
      setRecords(myRes.data.records);
      setSummary(myRes.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in');
      setTodayAttendance(res.data.attendance);
      setToast({ message: res.data.message, type: 'success' });
      fetchAttendance();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error checking in', type: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      setTodayAttendance(res.data.attendance);
      setToast({ message: res.data.message, type: 'success' });
      fetchAttendance();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error checking out', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Daily Attendance & Timesheet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record working hours, view punctuality logs, and track monthly timesheets
          </p>
        </div>

        {/* Check In / Out Quick Pill */}
        <div className="flex items-center gap-2">
          {!todayAttendance?.checkIn ? (
            <button
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Clock className="w-4 h-4" />
              Check In Today
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              <Clock className="w-4 h-4" />
              Check Out Now
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              ✓ Day Complete ({todayAttendance.workHours} hrs)
            </span>
          )}
        </div>
      </div>

      {/* Monthly Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Days Logged</span>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{summary.totalDays}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">On-Time Days</span>
          <p className="text-2xl font-bold text-emerald-800 mt-0.5">{summary.present}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Late Arrivals</span>
          <p className="text-2xl font-bold text-amber-800 mt-0.5">{summary.late}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Half-Days</span>
          <p className="text-2xl font-bold text-purple-800 mt-0.5">{summary.halfDay}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase">Total Hours</span>
          <p className="text-2xl font-bold text-indigo-800 mt-0.5">{summary.totalHours} hrs</p>
        </div>
      </div>

      {/* Filter by Month & Year */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Filter Period:</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Showing logs for {new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })}{' '}
          {year}
        </span>
      </div>

      {/* Timesheet Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving your timesheet logs..." />
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No attendance entries logged for this month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Check In Time</th>
                  <th className="px-6 py-3.5">Check Out Time</th>
                  <th className="px-6 py-3.5">Duration Logged</th>
                  <th className="px-6 py-3.5">Attendance Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-800">
                      {r.date}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-600">
                      {r.checkIn
                        ? new Date(r.checkIn).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-600">
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {r.workHours ? `${r.workHours} hrs` : r.checkIn ? 'Active Shift' : '0 hrs'}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="px-6 py-3.5 text-slate-400 italic">
                      {r.notes || 'Recorded via portal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

