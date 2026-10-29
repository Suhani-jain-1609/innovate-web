import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Briefcase, Building, AlertCircle, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Associate',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const res = await register(formData);

    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'manager') navigate('/manager');
      else navigate('/employee');
    } else {
      setErrorMessage(res.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 font-black text-xl">
          S
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white">Register StaffSync Account</h2>
        <p className="mt-1 text-xs text-slate-400">Join your organization workspace</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Alex Henderson"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Finance & Operations">Finance & Operations</option>
                  <option value="Product & Design">Product & Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Role Permission
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">HR Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

