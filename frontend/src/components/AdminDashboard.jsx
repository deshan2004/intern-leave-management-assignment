import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Search,
  MessageSquare,
} from 'lucide-react';
import { leaveService } from '../services/api';
import RejectModal from './RejectModal';

export default function AdminDashboard({ leaves, onActionCompleted }) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [actionError, setActionError] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      setActionError('');
      await leaveService.approve(id);
      onActionCompleted();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve leave request.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectConfirm = async (id, reason) => {
    await leaveService.reject(id, reason);
    onActionCompleted();
  };

  const filteredLeaves = leaves.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Security Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-800">Admin Mode Notice:</span> Per technical assignment guidelines, authentication is optional for this prototype. In a production deployment, these administrator operations would be secured using Role-Based Access Control (RBAC) via Spring Security & JWT tokens.
        </div>
      </div>

      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Submissions</div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{leaves.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="text-amber-700 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-emerald-700 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{approvedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm bg-red-50/20">
          <div className="text-red-700 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">{rejectedCount}</div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-medium">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-md transition ${
                    filter === st
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search employee, dept, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="py-3.5 px-4">Ref #</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Reason & Justification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 text-xs font-mono text-slate-400">
                      #{item.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">{item.employeeName}</div>
                      <div className="text-xs text-slate-500">{item.department}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.leaveType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div className="flex items-center space-x-1 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.startDate}</span>
                        <span className="text-slate-400">➔</span>
                        <span>{item.endDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs max-w-xs">
                      <div className="text-slate-700 truncate" title={item.reason}>
                        {item.reason || <span className="text-slate-400 italic">No reason provided</span>}
                      </div>
                      {item.rejectionReason && (
                        <div className="mt-1 text-red-600 bg-red-50 p-1.5 rounded border border-red-100 flex items-start space-x-1 text-[11px]">
                          <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span><strong>Rejection note:</strong> {item.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={loadingId === item.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1 disabled:opacity-50"
                            title="Approve Request"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{loadingId === item.id ? '...' : 'Approve'}</span>
                          </button>
                          <button
                            onClick={() => setRejectingItem(item)}
                            disabled={loadingId === item.id}
                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition flex items-center space-x-1 disabled:opacity-50"
                            title="Reject Request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Decision finalized
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!rejectingItem}
        leaveRequest={rejectingItem}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Approved
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
      Pending
    </span>
  );
}

