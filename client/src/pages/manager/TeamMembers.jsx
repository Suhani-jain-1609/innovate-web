import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Shield,
} from 'lucide-react';

export const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      setMembers(res.data.employees);
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenProfile = (m) => {
    setSelectedMember(m);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Direct Reports & Team Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of team members assigned to your leadership branch
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search team member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading direct reports roster..." />
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No team members found reporting to you.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-base overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{member.name}</h3>
                      <p className="text-xs text-slate-400">{member.designation}</p>
                      <span className="text-[11px] font-mono text-indigo-600 font-medium">
                        {member.employeeId}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={member.status} />
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Joined: {new Date(member.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Department: {member.department}</span>
                <button
                  onClick={() => handleOpenProfile(member)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Team Member Profile Card"
        maxWidth="max-w-xl"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center overflow-hidden">
                {selectedMember.avatar ? (
                  <img src={selectedMember.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  selectedMember.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800">{selectedMember.name}</h3>
                <p className="text-xs text-slate-500">{selectedMember.designation}</p>
                <p className="text-xs font-mono text-indigo-600 font-semibold">
                  {selectedMember.employeeId}
                </p>
              </div>
              <StatusBadge status={selectedMember.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Corporate Email</span>
                <span className="font-semibold text-slate-800">{selectedMember.email}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-800">{selectedMember.phone || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedMember.joiningDate).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Residential Location</span>
                <span className="font-semibold text-slate-800">
                  {selectedMember.address || 'San Francisco, CA'}
                </span>
              </div>
            </div>

            {/* Leave balances */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Available Leave Balances
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Casual</span>
                  <span className="font-bold text-slate-800">
                    {(selectedMember.leaveBalances?.casual?.total || 12) -
                      (selectedMember.leaveBalances?.casual?.used || 0)}{' '}
                    days left
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Sick</span>
                  <span className="font-bold text-slate-800">
                    {(selectedMember.leaveBalances?.sick?.total || 10) -
                      (selectedMember.leaveBalances?.sick?.used || 0)}{' '}
                    days left
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Annual</span>
                  <span className="font-bold text-slate-800">
                    {(selectedMember.leaveBalances?.annual?.total || 15) -
                      (selectedMember.leaveBalances?.annual?.used || 0)}{' '}
                    days left
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {selectedMember.emergencyContact?.name && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block mb-0.5">Emergency Contact</span>
                <p className="font-semibold text-slate-800">
                  {selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relationship}) -{' '}
                  {selectedMember.emergencyContact.phone}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

