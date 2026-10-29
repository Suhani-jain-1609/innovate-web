import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export const EmployeeTraining = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'enrolled'

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainings');
      setTrainings(res.data.trainings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleEnroll = async (trainingId) => {
    try {
      await api.post(`/trainings/${trainingId}/enroll`, {});
      setToast({ message: 'Successfully enrolled in training program', type: 'success' });
      fetchTrainings();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error enrolling', type: 'error' });
    }
  };

  const handleUpdateStatus = async (trainingId, status) => {
    try {
      await api.patch(`/trainings/${trainingId}/progress`, { status });
      setToast({ message: `Updated learning progress to ${status}`, type: 'success' });
      fetchTrainings();
    } catch (err) {
      setToast({ message: 'Error updating learning progress', type: 'error' });
    }
  };

  const myEnrolled = trainings.filter((t) =>
    t.enrolledEmployees?.some((e) => (e.user?._id || e.user) === user?._id)
  );

  const displayedTrainings = activeTab === 'all' ? trainings : myEnrolled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Learning & Development Programs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grow your skillset, attend workshops, and earn internal completion credits
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600 shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            All Programs ({trainings.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'enrolled'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            My Enrolled ({myEnrolled.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading training programs..." />
      ) : displayedTrainings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          {activeTab === 'enrolled'
            ? 'You have not enrolled in any training programs yet.'
            : 'No training programs currently scheduled.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTrainings.map((t) => {
            const enrollment = t.enrolledEmployees?.find(
              (e) => (e.user?._id || e.user) === user?._id
            );
            const isEnrolled = !!enrollment;

            return (
              <div
                key={t._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {t.department}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">{t.description}</p>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Trainer:</span>
                      <span className="font-semibold text-slate-800">{t.trainer}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Dates:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(t.startDate).toLocaleDateString()} to{' '}
                        {new Date(t.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">
                        {t.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  {isEnrolled ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700">My Status:</span>
                        <StatusBadge status={enrollment.status} />
                      </div>

                      {enrollment.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(t._id, 'completed')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {t.enrolledEmployees?.length || 0} / {t.capacity} Enrolled
                      </span>
                      <button
                        onClick={() => handleEnroll(t._id)}
                        disabled={t.enrolledEmployees?.length >= t.capacity}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                      >
                        Enroll Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

