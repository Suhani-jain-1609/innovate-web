import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  Edit,
  Trash2,
  Shield,
  Layers,
} from 'lucide-react';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const initialForm = {
    name: '',
    code: '',
    description: '',
    head: '',
    location: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/employees/managers/list');
      setManagers(res.data.managers);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head: dept.head?._id || '',
      location: dept.location || '',
    });
    setEditModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/departments', formData);
      setToast({ message: 'Department created successfully', type: 'success' });
      setAddModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating department', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    try {
      setSubmitting(true);
      await api.put(`/departments/${selectedDept._id}`, formData);
      setToast({ message: 'Department updated successfully', type: 'success' });
      setEditModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating department', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (dept.employeeCount > 0) {
      setToast({
        message: `Cannot delete ${dept.name} while ${dept.employeeCount} employee(s) are assigned to it.`,
        type: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the ${dept.name} department?`)) return;

    try {
      await api.delete(`/departments/${dept._id}`);
      setToast({ message: 'Department deleted successfully', type: 'success' });
      fetchDepartments();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting department', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Departments & Organizational Units
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structure divisions, designate department leaders, and monitor team allocations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No departments created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{dept.name}</h3>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      title="Delete Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {dept.description || 'No description provided.'}
                </p>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Department Head:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {dept.head?.name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Office Location:
                    </span>
                    <span className="font-medium text-slate-700">{dept.location || 'Main Office'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5" />
                  {dept.employeeCount || 0} Staff Members
                </span>
                <span className="text-[11px] text-slate-400">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New Department"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Legal & Compliance"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Code (Short ID)
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. LEG"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Department Head
            </label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            >
              <option value="">Select Department Leader (Optional)</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Office Location / Floor
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Level 3, West Wing"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope of work and responsibilities..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Department"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department Name
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
                Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Department Head
            </label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            >
              <option value="">Unassigned</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Office Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {submitting ? 'Saving...' : 'Update Department'}
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

