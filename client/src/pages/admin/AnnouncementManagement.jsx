import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  User,
  Edit,
  Trash2,
  Tag,
  Building,
} from 'lucide-react';

export const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const initialForm = {
    title: '',
    content: '',
    category: 'general',
    targetDepartment: 'All',
    priority: 'normal',
    isPinned: false,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
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
    fetchAnnouncements();
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedAnnouncement(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      targetDepartment: item.targetDepartment,
      priority: item.priority,
      isPinned: item.isPinned,
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/announcements', formData);
      setToast({ message: 'Announcement published successfully', type: 'success' });
      setCreateModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error publishing', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    try {
      setSubmitting(true);
      await api.put(`/announcements/${selectedAnnouncement._id}`, formData);
      setToast({ message: 'Announcement updated successfully', type: 'success' });
      setEditModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    try {
      await api.delete(`/announcements/${item._id}`);
      setToast({ message: 'Announcement deleted', type: 'success' });
      fetchAnnouncements();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Company Communications & Bulletins
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast organization policies, cultural updates, events, and departmental bulletins
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner text="Loading communications..." />
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No announcements published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                item.isPinned
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-sm'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 fill-indigo-700" />
                      Pinned Announcement
                    </span>
                  )}
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: <strong className="text-slate-600">{item.targetDepartment}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Announcement"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    title="Delete Announcement"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    Posted by <strong>{item.author?.name}</strong> ({item.author?.designation})
                  </span>
                </div>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast Announcement"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q4 All-Hands Meeting & Strategy Review"
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
                <option value="general">General Update</option>
                <option value="policy">HR Policy</option>
                <option value="event">Corporate Event</option>
                <option value="urgent">Urgent Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Target Department
              </label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
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
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Body Content
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide complete communication details..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinBox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pinBox" className="text-xs font-medium text-slate-700">
              Pin to top of feed
            </label>
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
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Announcement"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Headline
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              >
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Target Department
              </label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Body Content
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinBoxEdit"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pinBoxEdit" className="text-xs font-medium text-slate-700">
              Pin to top
            </label>
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
              {submitting ? 'Updating...' : 'Update Announcement'}
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

