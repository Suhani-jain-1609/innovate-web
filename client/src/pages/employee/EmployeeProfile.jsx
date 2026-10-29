import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, RoleBadge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Lock,
  Shield,
  Save,
  Key,
} from 'lucide-react';

export const EmployeeProfile = () => {
  const { user, updateUser } = useAuth();
  const [toast, setToast] = useState(null);

  // Personal Info Form
  const [personalForm, setPersonalForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyRel: user?.emergencyContact?.relationship || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await api.put('/auth/profile', {
        phone: personalForm.phone,
        address: personalForm.address,
        emergencyContact: {
          name: personalForm.emergencyName,
          relationship: personalForm.emergencyRel,
          phone: personalForm.emergencyPhone,
        },
      });
      updateUser(res.data.user);
      setToast({ message: 'Personal profile updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error updating profile', type: 'error' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setToast({ message: 'Password changed successfully', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error changing password', type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          My Account & Employee Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review employment records, adjust contact preferences, and manage security credentials
        </p>
      </div>

      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center overflow-hidden border border-indigo-200 shadow-sm shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <RoleBadge role={user?.role} />
            <StatusBadge status={user?.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user?.designation}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-2 font-mono">
            <span>ID: <strong className="text-indigo-600">{user?.employeeId}</strong></span>
            <span>Dept: <strong className="text-slate-600 font-sans">{user?.department}</strong></span>
            <span>Joined: <strong className="text-slate-600 font-sans">{new Date(user?.joiningDate).toLocaleDateString()}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employment Metadata Read-only */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Official Employment Record
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Corporate Email</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Department Assignment</span>
              <span className="font-semibold text-slate-800">{user?.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Designation / Title</span>
              <span className="font-semibold text-slate-800">{user?.designation}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Reporting Supervisor</span>
              <span className="font-semibold text-slate-800">
                {user?.reportingManager?.name || 'Direct / HR Administration'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Workforce Status</span>
              <span className="font-semibold text-emerald-600 capitalize">{user?.status} Member</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Personal Contact Info & Change Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">
              Contact & Emergency Information
            </h3>

            <form onSubmit={handlePersonalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={personalForm.address}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, address: e.target.value })
                    }
                    placeholder="City, State"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                  Emergency Contact Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={personalForm.emergencyName}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, emergencyName: e.target.value })
                      }
                      placeholder="e.g. Rachel Vance"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={personalForm.emergencyRel}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, emergencyRel: e.target.value })
                      }
                      placeholder="e.g. Spouse / Sibling"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={personalForm.emergencyPhone}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, emergencyPhone: e.target.value })
                      }
                      placeholder="+1 (555) 999-9999"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {updatingProfile ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Security & Password Reset
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Min. 6 characters"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {changingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

