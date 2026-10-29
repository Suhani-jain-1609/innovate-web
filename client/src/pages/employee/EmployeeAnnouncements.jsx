import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PriorityBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Megaphone, Pin, User, Calendar, Tag } from 'lucide-react';

export const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== 'All') params.category = category;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Company Bulletins & Notices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay informed with organization announcements, executive updates, and cultural milestones
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600 shadow-xs">
          {['All', 'general', 'policy', 'event', 'urgent'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                category === c
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving bulletins..." />
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No notices posted in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                item.isPinned
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-sm'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
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
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    Posted by <strong>{item.author?.name}</strong> ({item.author?.designation})
                  </span>
                </div>
                <span className="text-indigo-600 font-medium">Audience: {item.targetDepartment}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

