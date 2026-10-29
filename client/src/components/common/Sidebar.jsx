import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Building2,
  GraduationCap,
  Megaphone,
  FileBarChart2,
  UserCheck,
  User,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Leave Management', path: '/admin/leaves', icon: CalendarCheck },
        { name: 'Attendance Monitor', path: '/admin/attendance', icon: Clock },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
        { name: 'Training Programs', path: '/admin/trainings', icon: GraduationCap },
        { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { name: 'Reports & Analytics', path: '/admin/reports', icon: FileBarChart2 },
      ];
    }

    if (user?.role === 'manager') {
      return [
        { name: 'Team Dashboard', path: '/manager', icon: LayoutDashboard },
        { name: 'My Team', path: '/manager/team', icon: Users },
        { name: 'Team Leaves', path: '/manager/leaves', icon: CalendarCheck },
        { name: 'Team Attendance', path: '/manager/attendance', icon: Clock },
        { name: 'Team Training', path: '/manager/training', icon: GraduationCap },
        { name: 'Announcements', path: '/manager/announcements', icon: Megaphone },
      ];
    }

    // Default: Employee
    return [
      { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
      { name: 'Daily Attendance', path: '/employee/attendance', icon: Clock },
      { name: 'Leave Applications', path: '/employee/leaves', icon: CalendarCheck },
      { name: 'Training & Programs', path: '/employee/training', icon: GraduationCap },
      { name: 'Announcements', path: '/employee/announcements', icon: Megaphone },
      { name: 'My Profile', path: '/employee/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">StaffSync</span>
              <span className="text-[10px] text-indigo-400 block font-medium uppercase tracking-wider">
                {user?.role === 'admin' ? 'HR Portal' : user?.role === 'manager' ? 'Manager Hub' : 'Employee Desk'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/manager' || item.path === '/employee'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden border border-slate-700">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.designation || user?.department}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

