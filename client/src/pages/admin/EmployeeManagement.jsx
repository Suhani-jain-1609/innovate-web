import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge, RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Eye,
  Power,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  UserCheck,
  Shield,
  Key,
} from 'lucide-react';

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const initialForm = {
    employeeId: '',
    name: '',
    email: '',
    password: 'Password123!',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManager: '',
    phone: '',
    address: '',
    salary: 60000,
    emergencyContact: { name: '', relationship: '', phone: '' },
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (deptFilter && deptFilter !== 'All') params.department = deptFilter;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;

      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [mgrRes, deptRes] = await Promise.all([
        api.get('/employees/managers/list'),
        api.get('/departments'),
      ]);
      setManagersList(mgrRes.data.managers);
      setDepartmentsList(deptRes.data.departments);
    } catch (err) {
      console.error('Error fetching auxiliary data:', err);
    }
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, deptFilter, statusFilter, roleFilter]);

  const handleOpenAdd = () => {
    // Generate next emp id
    const nextId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    setFormData({ ...initialForm, employeeId: nextId });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      reportingManager: emp.reportingManager?._id || '',
      phone: emp.phone || '',
      address: emp.address || '',
      salary: emp.salary || 50000,
      emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' },
    });
    setEditModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setViewModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/employees', formData);
      setToast({ message: 'Employee profile registered successfully', type: 'success' });
      setAddModalOpen(false);
      fetchEmployees();
      fetchAuxiliaryData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating employee', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setSubmitting(true);
      await api.put(`/employees/${selectedEmployee._id}`, formData);
      setToast({ message: 'Employee record updated successfully', type: 'success' });
      setEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating employee', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const action = emp.status === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) return;

    try {
      const res = await api.patch(`/employees/${emp._id}/status`);
      setToast({ message: res.data.message, type: 'success' });
      fetchEmployees();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error toggling status', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain employee records, job roles, reporting chains, and credentials
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add New Employee
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="employee">Employees</option>
            <option value="manager">Managers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading employee directory..." />
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No employee records match the given criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee ID & Name</th>
                  <th className="px-6 py-3.5">Department & Title</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Reporting Manager</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Avatar */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
                          {emp.avatar ? (
                            <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            emp.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                          <span className="font-mono text-[11px] text-indigo-600 font-medium">
                            {emp.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department & Designation */}
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800">{emp.department}</p>
                      <p className="text-[11px] text-slate-400">{emp.designation}</p>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3.5">
                      <RoleBadge role={emp.role} />
                    </td>

                    {/* Reporting Manager */}
                    <td className="px-6 py-3.5">
                      {emp.reportingManager ? (
                        <div>
                          <p className="font-medium text-slate-700">{emp.reportingManager.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {emp.reportingManager.designation}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct / Self</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-3.5 text-slate-600">
                      <p className="truncate max-w-[150px]">{emp.email}</p>
                      <p className="text-[11px] text-slate-400">{emp.phone || 'No phone'}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <StatusBadge status={emp.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(emp)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Employee"
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'active' ? 'Deactivate Record' : 'Activate Record'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'active'
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Employee"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Employee ID
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jessica Taylor"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jessica@staffsync.com"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Initial Password
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Role Permission
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">HR Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {departmentsList.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Designation / Job Title
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Reporting Manager
              </label>
              <select
                value={formData.reportingManager}
                onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None / Self-Directed</option>
                {managersList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Joining Date
              </label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Annual Salary ($)
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Employee Information"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Employee ID
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Reset Password (Optional)
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Role Permission
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">HR Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                {departmentsList.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Reporting Manager
              </label>
              <select
                value={formData.reportingManager}
                onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="">None / Self-Directed</option>
                {managersList
                  .filter((m) => m._id !== selectedEmployee?._id)
                  .map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.designation})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Annual Salary ($)
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Profile Modal / Employment Card */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Employee Employment Profile"
        maxWidth="max-w-xl"
      >
        {selectedEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl overflow-hidden border border-indigo-200">
                {selectedEmployee.avatar ? (
                  <img
                    src={selectedEmployee.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedEmployee.name?.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">{selectedEmployee.name}</h3>
                  <StatusBadge status={selectedEmployee.status} />
                </div>
                <p className="text-xs text-slate-500">{selectedEmployee.designation}</p>
                <p className="text-xs font-mono text-indigo-600 font-semibold mt-0.5">
                  {selectedEmployee.employeeId}
                </p>
              </div>
              <RoleBadge role={selectedEmployee.role} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-semibold text-slate-800">
                  {selectedEmployee.department}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-800">
                  {selectedEmployee.phone || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Reporting Manager</span>
                <span className="font-semibold text-slate-800">
                  {selectedEmployee.reportingManager?.name || 'Direct / None'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Compensation</span>
                <span className="font-semibold text-slate-800">
                  ${selectedEmployee.salary?.toLocaleString() || '50,000'} / yr
                </span>
              </div>
            </div>

            {/* Leave Balances Breakdown */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Leave Balances
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Casual</span>
                  <span className="font-bold text-slate-800">
                    {(selectedEmployee.leaveBalances?.casual?.total || 12) -
                      (selectedEmployee.leaveBalances?.casual?.used || 0)}{' '}
                    left
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Sick</span>
                  <span className="font-bold text-slate-800">
                    {(selectedEmployee.leaveBalances?.sick?.total || 10) -
                      (selectedEmployee.leaveBalances?.sick?.used || 0)}{' '}
                    left
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Annual</span>
                  <span className="font-bold text-slate-800">
                    {(selectedEmployee.leaveBalances?.annual?.total || 15) -
                      (selectedEmployee.leaveBalances?.annual?.used || 0)}{' '}
                    left
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {selectedEmployee.emergencyContact?.name && (
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                <span className="text-slate-400 block mb-1">Emergency Contact</span>
                <p className="font-semibold text-slate-800">
                  {selectedEmployee.emergencyContact.name} (
                  {selectedEmployee.emergencyContact.relationship}) -{' '}
                  {selectedEmployee.emergencyContact.phone}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

