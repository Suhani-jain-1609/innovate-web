import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  Plus,
  Users,
  Award,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const TeamTraining = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const initialForm = {
    title: '',
    description: '',
    trainer: user?.name || '',
    department: user?.department || 'Engineering',
    startDate: '',
    endDate: '',
    capacity: 15,
    location: 'Meeting Room / Teams',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, mRes] = await Promise.all([
        api.get('/trainings'),
        api.get('/employees'),
      ]);
      setTrainings(tRes.data.trainings);
      setTeamMembers(mRes.data.employees);
      if (mRes.data.employees.length > 0) {
        setSelectedMemberId(mRes.data.employees[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({ ...initialForm, trainer: user?.name || '' });
    setCreateModalOpen(true);
  };

  const handleOpenEnroll = (training) => {
    setSelectedTraining(training);
    setEnrollModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/trainings', formData);
      setToast({ message: 'Training session created successfully', type: 'success' });
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating training', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollMember = async (e) => {
    e.preventDefault();
    if (!selectedTraining || !selectedMemberId) return;

    try {
      await api.post(`/trainings/${selectedTraining._id}/enroll`, {
        userId: selectedMemberId,
      });
      setToast({ message: 'Team member enrolled in session', type: 'success' });
      setEnrollModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error enrolling member', type: 'error' });
    }
  };

  const handleMarkProgress = async (trainingId, memberId, newStatus) => {
    try {
      await api.patch(`/trainings/${trainingId}/progress`, {
        userId: memberId,
        status: newStatus,
      });
      setToast({ message: `Updated status to ${newStatus}`, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Error updating status', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Team Learning & Skill Development
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct workshops, enroll team members, and track professional certifications
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Team Training
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading training programs..." />
      ) : trainings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No training sessions available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trainings.map((t) => {
            const teamEnrolled = t.enrolledEmployees?.filter((e) =>
              teamMembers.some((m) => m._id === (e.user?._id || e.user))
            );

            return (
              <div
                key={t._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {t.department}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-1">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{t.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 mb-3">
                    <p className="text-slate-600">
                      <strong>Trainer:</strong> {t.trainer}
                    </p>
                    <p className="text-slate-600">
                      <strong>Dates:</strong> {new Date(t.startDate).toLocaleDateString()} to{' '}
                      {new Date(t.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-slate-600">
                      <strong>Location:</strong> {t.location}
                    </p>
                  </div>

                  {/* Team Members in this training */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Your Team Members Enrolled ({teamEnrolled?.length || 0}):
                    </span>
                    {teamEnrolled?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">None of your team is enrolled yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {teamEnrolled.map((enr) => {
                          const mUser = enr.user;
                          return (
                            <div
                              key={mUser?._id || enr._id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-200/60"
                            >
                              <span className="font-semibold text-slate-800">{mUser?.name}</span>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={enr.status} />
                                {enr.status !== 'completed' && (
                                  <button
                                    onClick={() => handleMarkProgress(t._id, mUser?._id, 'completed')}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Total Enrolled: {t.enrolledEmployees?.length || 0} / {t.capacity}
                  </span>
                  <button
                    onClick={() => handleOpenEnroll(t)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
                  >
                    + Enroll Team Member
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Team Training"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Trainer
              </label>
              <input
                type="text"
                required
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Max Seats
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title="Enroll Team Member in Training"
      >
        {selectedTraining && (
          <form onSubmit={handleEnrollMember} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block mb-0.5">Program</span>
              <p className="font-bold text-slate-800">{selectedTraining.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Select Direct Report
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Confirm Enrollment
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

