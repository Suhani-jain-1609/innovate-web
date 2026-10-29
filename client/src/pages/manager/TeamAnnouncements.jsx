import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Megaphone, Plus, Pin, User } from 'lucide-react';

export const TeamAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetDepartment: user?.department || 'Engineering',
    priority: 'normal',
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/announcements', formData);
      setToast({ message: 'Team announcement published', type: 'success' });
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error posting', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Team Bulletins & Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish team updates and view organization-wide notices
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post Team Update
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading communications..." />
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No announcements found.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                item.isPinned ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-indigo-700" /> Pinned
                    </span>
                  )}
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] text-slate-500">Audience: {item.targetDepartment}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3">
                {item.content}
              </p>

              <div className="border-t border-slate-100 pt-2.5 flex items-center gap-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>
                  Author: {item.author?.name} ({item.author?.designation})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Team Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Sprint Retrospective & Release Schedule"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="general">General</option>
                <option value="event">Team Event</option>
                <option value="policy">Policy / Guideline</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Update'}
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

