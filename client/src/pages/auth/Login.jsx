import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Modal } from '../../components/common/Modal';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  Users,
  KeyRound,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Forgot password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [submittingReset, setSubmittingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginEmail, loginPassword) => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessNotice('');

    const res = await login(loginEmail, loginPassword);

    if (res.success) {
      const role = res.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else navigate('/employee');
    } else {
      setErrorMessage(res.message);
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    handleLogin(email, password);
  };

  const handleQuickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    handleLogin(demoEmail, 'Password123!');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmittingReset(true);
    setResetMessage(null);

    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        newPassword: newResetPassword,
      });

      setResetMessage({ type: 'success', text: res.data.message });
      setEmail(resetEmail);
      setPassword(newResetPassword);
      setTimeout(() => {
        setResetModalOpen(false);
        setSuccessNotice('Password reset successfully. You can now log in.');
      }, 1500);
    } catch (err) {
      setResetMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error resetting password',
      });
    } finally {
      setSubmittingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 font-black text-2xl tracking-tighter">
          S
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
          Staff<span className="text-indigo-400">Sync</span> HRMS
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Centralized Enterprise Human Resource Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-700">{errorMessage}</p>
            </div>
          )}

          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-emerald-700">{successNotice}</p>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                1-Click Quick Demo Login
              </span>
              <span className="text-[11px] text-slate-400">Instant Role Evaluation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@staffsync.com')}
                disabled={submitting}
                className="flex flex-col items-center p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 group-hover:scale-105 transition-transform">
                  HR
                </div>
                <span className="text-xs font-bold text-slate-800">HR Admin</span>
                <span className="text-[10px] text-slate-500">Sarah Jenkins</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.manager@staffsync.com')}
                disabled={submitting}
                className="flex flex-col items-center p-3 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-100 hover:border-sky-300 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 group-hover:scale-105 transition-transform">
                  MGR
                </div>
                <span className="text-xs font-bold text-slate-800">Team Manager</span>
                <span className="text-[10px] text-slate-500">Alex Rivera</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('marcus@staffsync.com')}
                disabled={submitting}
                className="flex flex-col items-center p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 group-hover:scale-105 transition-transform">
                  EMP
                </div>
                <span className="text-xs font-bold text-slate-800">Employee</span>
                <span className="text-[10px] text-slate-500">Marcus Vance</span>
              </button>
            </div>
          </div>

          {/* Standard Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetModalOpen(true);
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Default demo password: <code className="text-indigo-600 font-mono">Password123!</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register employee account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Account Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your employee email and specify your desired new password to restore access.
          </p>

          {resetMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                resetMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {resetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. marcus@staffsync.com"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newResetPassword}
              onChange={(e) => setNewResetPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {submittingReset ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
