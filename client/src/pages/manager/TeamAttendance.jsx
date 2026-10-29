import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Clock, Calendar, CheckCircle, AlertTriangle, UserX } from 'lucide-react';

export const TeamAttendance = () => {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getToday());
  const [teamStatus, setTeamStatus] = useState([]);
  const [summary, setSummary] = useState({ totalTeam: 0, present: 0, late: 0, halfDay: 0, absent: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTeamAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/team', { params: { date } });
      setTeamStatus(res.data.teamStatus);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching team attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAttendance();
  }, [date]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Team Attendance Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily clock-ins, shift completion, punctuality, and absences for direct reports
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Team Size</span>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{summary.totalTeam}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Present</span>
          <p className="text-2xl font-bold text-emerald-800 mt-0.5">{summary.present}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Late</span>
          <p className="text-2xl font-bold text-amber-800 mt-0.5">{summary.late}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Half Day</span>
          <p className="text-2xl font-bold text-purple-800 mt-0.5">{summary.halfDay}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase">Absent</span>
          <p className="text-2xl font-bold text-rose-800 mt-0.5">{summary.absent}</p>
        </div>
      </div>

      {/* Team Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Checking team logs..." />
        ) : teamStatus.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No direct reports assigned.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Team Member</th>
                  <th className="px-6 py-3.5">Check In Time</th>
                  <th className="px-6 py-3.5">Check Out Time</th>
                  <th className="px-6 py-3.5">Logged Hours</th>
                  <th className="px-6 py-3.5">Attendance Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamStatus.map((item) => (
                  <tr key={item.member._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
                          {item.member.avatar ? (
                            <img src={item.member.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            item.member.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.member.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {item.member.employeeId} • {item.member.designation}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {item.attendance?.checkIn
                        ? new Date(item.attendance.checkIn).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {item.attendance?.checkOut
                        ? new Date(item.attendance.checkOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {item.attendance?.workHours
                        ? `${item.attendance.workHours} hrs`
                        : item.attendance?.checkIn
                        ? 'On Shift'
                        : '0 hrs'}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-3.5 text-slate-400 italic">
                      {item.attendance?.notes || (item.status === 'absent' ? 'No clock-in' : 'Normal')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

