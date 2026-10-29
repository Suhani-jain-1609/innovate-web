import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Award,
} from 'lucide-react';

export const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewEnrolledModalOpen, setViewEnrolledModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  const initialForm = {
    title: '',
    description: '',
    trainer: '',
    department: 'All',
    startDate: '',
    endDate: '',
    capacity: 25,
    location: 'Conference Room 4A / Hybrid Zoom',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainings');
      setTrainings(res.data.trainings);
    } catch (err) {
      console.error('Error fetching trainings:', err);
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
    fetchTrainings();
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const handleOpenEnrolled = (training) => {
    setSelectedTraining(training);
    setViewEnrolledModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/trainings', formData);
      setToast({ message: 'Training session scheduled successfully', type: 'success' });
      setCreateModalOpen(false);
      fetchTrainings();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating training', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateParticipantProgress = async (trainingId, userId, newStatus) => {
    try {
      await api.patch(`/trainings/${trainingId}/progress`, {
        userId,
        status: newStatus,
      });
      setToast({ message: `Participant status marked as ${newStatus}`, type: 'success' });
      const res = await api.get('/trainings');
      setTrainings(res.data.trainings);
      const updated = res.data.trainings.find((t) => t._id === trainingId);
      if (updated) setSelectedTraining(updated);
    } catch (err) {
      setToast({ message: 'Error updating participant status', type: 'error' });
    }
  };

  const handleDelete = async (training) => {
    if (!window.confirm(`Are you sure you want to delete "${training.title}"?`)) return;
    try {
      await api.delete(`/trainings/${training._id}`);
      setToast({ message: 'Training program removed', type: 'success' });
      fetchTrainings();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting training', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Workforce Training & Development
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate learning curriculum, track employee certifications, and upskilling progress
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Training Program
        </button>
      </div>

      {/* Grid of Programs */}
      {loading ? (
        <LoadingSpinner text="Loading training programs..." />
      ) : trainings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No training sessions scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainings.map((program) => {
            const enrolledCount = program.enrolledEmployees?.length || 0;
            const completedCount =
              program.enrolledEmployees?.filter((e) => e.status === 'completed').length || 0;

            return (
              <div
                key={program._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={program.status} />
                    <button
                      onClick={() => handleDelete(program)}
                      title="Delete Training"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2">
                    {program.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">{program.description}</p>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-semibold text-slate-800">{program.trainer}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Target Dept:</span>
                      <span className="font-medium text-indigo-600">{program.department}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Schedule:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(program.startDate).toLocaleDateString()} -{' '}
                        {new Date(program.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">
                        {program.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {enrolledCount} / {program.capacity} Enrolled
                    </span>
                    <span className="text-[11px] text-emerald-600 block">
                      {completedCount} Graduated
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEnrolled(program)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Training Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Training Session"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Program Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Advanced System Design & Microservices"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Trainer / Institute
              </label>
              <input
                type="text"
                required
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                placeholder="e.g. Alex Rivera or Cloud Academy"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Audience Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Maximum Seats
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Location / Platform
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Training Room B / MS Teams"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Curriculum Overview & Objectives
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline what skills and topics will be learned..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Enrolled Participants Modal */}
      <Modal
        isOpen={viewEnrolledModalOpen}
        onClose={() => setViewEnrolledModalOpen(false)}
        title="Training Session Enrolled Roster"
        maxWidth="max-w-2xl"
      >
        {selectedTraining && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs">{selectedTraining.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instructor: {selectedTraining.trainer} • Capacity: {selectedTraining.capacity} seats
              </p>
            </div>

            {selectedTraining.enrolledEmployees?.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">
                No employees enrolled in this program yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {selectedTraining.enrolledEmployees.map((enrollment) => (
                  <div
                    key={enrollment.user?._id || enrollment._id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                        {enrollment.user?.avatar ? (
                          <img src={enrollment.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          enrollment.user?.name?.charAt(0) || 'E'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{enrollment.user?.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {enrollment.user?.department} • {enrollment.user?.employeeId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={enrollment.status} />

                      {enrollment.status !== 'completed' && (
                        <button
                          onClick={() =>
                            handleUpdateParticipantProgress(
                              selectedTraining._id,
                              enrollment.user._id,
                              'completed'
                            )
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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

