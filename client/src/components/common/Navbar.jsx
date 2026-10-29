import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';
import {
  Menu,
  Clock,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle,
  Briefcase,
} from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileLink = () => {
    return '/employee/profile';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Section: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-xl tracking-tight">
              S
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-slate-800">
                Staff<span className="text-indigo-600">Sync</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1 tracking-wider uppercase">
                Enterprise HRMS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Clock & Quick Date */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-800 font-mono">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {/* Right Section: Role indicator & User Menu */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:block">
              <RoleBadge role={user.role} />
            </div>
          )}

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs overflow-hidden border border-slate-200">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-slate-800 line-clamp-1">{user?.name}</p>
                <p className="text-slate-400 text-[11px] line-clamp-1">{user?.department || 'Staff'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-2">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getProfileLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    {user?.role === 'employee' && (
                      <Link
                        to="/employee/attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <Clock className="w-4 h-4 text-slate-400" />
                        Daily Attendance
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

