import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge, RoleBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileBarChart2,
  Download,
  Calendar,
  Filter,
  Users,
  Clock,
  CalendarCheck,
  Printer,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export const ReportsManagement = () => {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leaves' | 'employees'
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Attendance filters
  const [attStartDate, setAttStartDate] = useState('2026-10-01');
  const [attEndDate, setAttEndDate] = useState('2026-10-31');
  const [attDept, setAttDept] = useState('All');
  const [attRecords, setAttRecords] = useState([]);

  // Leave filters
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveDept, setLeaveDept] = useState('All');
  const [leaveStatus, setLeaveStatus] = useState('All');
  const [leaveRecords, setLeaveRecords] = useState([]);

  // Employee report filters
  const [empDept, setEmpDept] = useState('All');
  const [empStatus, setEmpStatus] = useState('All');
  const [empRecords, setEmpRecords] = useState([]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (attStartDate && attEndDate) {
        params.startDate = attStartDate;
        params.endDate = attEndDate;
      }
      if (attDept && attDept !== 'All') params.department = attDept;

      const res = await api.get('/reports/attendance', { params });
      setAttRecords(res.data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (leaveStartDate && leaveEndDate) {
        params.startDate = leaveStartDate;
        params.endDate = leaveEndDate;
      }
      if (leaveDept && leaveDept !== 'All') params.department = leaveDept;
      if (leaveStatus && leaveStatus !== 'All') params.status = leaveStatus;

      const res = await api.get('/reports/leaves', { params });
      setLeaveRecords(res.data.leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (empDept && empDept !== 'All') params.department = empDept;
      if (empStatus && empStatus !== 'All') params.status = empStatus;

      const res = await api.get('/employees', { params });
      setEmpRecords(res.data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceReport();
    } else if (activeTab === 'leaves') {
      fetchLeaveReport();
    } else {
      fetchEmployeeReport();
    }
  }, [
    activeTab,
    attStartDate,
    attEndDate,
    attDept,
    leaveStartDate,
    leaveEndDate,
    leaveDept,
    leaveStatus,
    empDept,
    empStatus,
  ]);

  // Export CSV
  const exportAttendanceCSV = () => {
    if (attRecords.length === 0) return;
    const headers = ['Employee ID,Name,Department,Date,Status,Check In,Check Out,Hours Worked,Notes\n'];
    const rows = attRecords.map((r) =>
      [
        `"${r.user?.employeeId || ''}"`,
        `"${r.user?.name || ''}"`,
        `"${r.user?.department || ''}"`,
        `"${r.date}"`,
        `"${r.status}"`,
        `"${r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : ''}"`,
        `"${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : ''}"`,
        `"${r.workHours || 0}"`,
        `"${r.notes || ''}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StaffSync_Attendance_Report_${attStartDate}_to_${attEndDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportLeavesCSV = () => {
    if (leaveRecords.length === 0) return;
    const headers = ['Employee ID,Name,Department,Leave Type,Start Date,End Date,Days,Status,Reviewed By,Comments\n'];
    const rows = leaveRecords.map((l) =>
      [
        `"${l.user?.employeeId || ''}"`,
        `"${l.user?.name || ''}"`,
        `"${l.user?.department || ''}"`,
        `"${l.leaveType}"`,
        `"${new Date(l.startDate).toLocaleDateString()}"`,
        `"${new Date(l.endDate).toLocaleDateString()}"`,
        `"${l.days}"`,
        `"${l.status}"`,
        `"${l.reviewedBy?.name || ''}"`,
        `"${l.reviewComments || ''}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StaffSync_Leave_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportEmployeeCSV = () => {
    if (empRecords.length === 0) return;
    const headers = ['Employee ID,Name,Email,Department,Designation,Role,Joining Date,Annual Salary,Status,Reporting Manager\n'];
    const rows = empRecords.map((e) =>
      [
        `"${e.employeeId}"`,
        `"${e.name}"`,
        `"${e.email}"`,
        `"${e.department}"`,
        `"${e.designation}"`,
        `"${e.role}"`,
        `"${new Date(e.joiningDate).toLocaleDateString()}"`,
        `"${e.salary || 0}"`,
        `"${e.status}"`,
        `"${e.reportingManager?.name || 'Self/None'}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StaffSync_Employee_Master_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (activeTab === 'attendance') exportAttendanceCSV();
    else if (activeTab === 'leaves') exportLeavesCSV();
    else exportEmployeeCSV();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Analytics & Executive Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, filter, print, and export attendance records, leave audits, and employee workforce data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-4 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Attendance Audit Report
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Leave Utilization Report
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Workforce & Payroll Report
        </button>
      </div>

      {/* Tab 1: Attendance Report */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={attStartDate}
                onChange={(e) => setAttStartDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={attEndDate}
                onChange={(e) => setAttEndDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>

            <select
              value={attDept}
              onChange={(e) => setAttDept(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <span className="ml-auto text-xs font-semibold text-slate-500">
              {attRecords.length} Records Compiled
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <LoadingSpinner text="Generating attendance metrics..." />
            ) : attRecords.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No attendance logs found in this date range.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Check In</th>
                      <th className="px-6 py-3">Check Out</th>
                      <th className="px-6 py-3">Hours Logged</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono font-medium text-slate-700">{r.date}</td>
                        <td className="px-6 py-3 font-semibold text-slate-800">
                          {r.user?.name} ({r.user?.employeeId})
                        </td>
                        <td className="px-6 py-3 text-slate-600">{r.user?.department}</td>
                        <td className="px-6 py-3 font-mono text-slate-600">
                          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-600">
                          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-800">{r.workHours || 0} hrs</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Leave Report */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <select
              value={leaveStatus}
              onChange={(e) => setLeaveStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="All">All Leave Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={leaveDept}
              onChange={(e) => setLeaveDept(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <span className="ml-auto text-xs font-semibold text-slate-500">
              {leaveRecords.length} Requests Found
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <LoadingSpinner text="Compiling leave audits..." />
            ) : leaveRecords.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No leave records match the filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Period</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Supervisor Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveRecords.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-semibold text-slate-800">
                          {l.user?.name} ({l.user?.employeeId})
                        </td>
                        <td className="px-6 py-3 text-slate-600">{l.user?.department}</td>
                        <td className="px-6 py-3 capitalize font-medium">{l.leaveType}</td>
                        <td className="px-6 py-3 text-slate-600">
                          {new Date(l.startDate).toLocaleDateString()} to{' '}
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-800">{l.days} d</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-6 py-3 text-slate-500 italic max-w-xs truncate">
                          {l.reviewComments || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Employee Workforce & Compensation Report */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <select
              value={empDept}
              onChange={(e) => setEmpDept(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={empStatus}
              onChange={(e) => setEmpStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="All">All Employment Status</option>
              <option value="active">Active Members</option>
              <option value="inactive">Deactivated Records</option>
            </select>

            <span className="ml-auto text-xs font-semibold text-slate-500">
              {empRecords.length} Employees Found
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <LoadingSpinner text="Generating employee directory report..." />
            ) : empRecords.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No employees matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Employee ID</th>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Designation</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Joining Date</th>
                      <th className="px-6 py-3">Annual Salary</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empRecords.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono font-bold text-indigo-600">{e.employeeId}</td>
                        <td className="px-6 py-3 font-semibold text-slate-800">{e.name}</td>
                        <td className="px-6 py-3 text-slate-600">{e.email}</td>
                        <td className="px-6 py-3 text-slate-700">{e.department}</td>
                        <td className="px-6 py-3 text-slate-600">{e.designation}</td>
                        <td className="px-6 py-3">
                          <RoleBadge role={e.role} />
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-mono">
                          {new Date(e.joiningDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-800">
                          ${e.salary ? e.salary.toLocaleString() : '50,000'}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={e.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
