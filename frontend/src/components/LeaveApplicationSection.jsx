import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  User,
  Sparkles,
  ArrowRight,
  UserCheck,
  Pencil,
  Trash2,
  X,
  Save,
  Lock,
} from 'lucide-react';
import { leaveService } from '../services/api';

export default function LeaveApplicationSection({ employees, leaves, onLeaveSubmitted, showToast, currentUser }) {
  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const [employeeId, setEmployeeId] = useState(
    isEmployee && currentUser?.id ? String(currentUser.id) : ''
  );
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Leave State
  const [editingLeave, setEditingLeave] = useState(null);
  const [editLeaveType, setEditLeaveType] = useState('ANNUAL');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editReason, setEditReason] = useState('');
  const [updatingLeave, setUpdatingLeave] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (isEmployee && currentUser?.id) {
      setEmployeeId(String(currentUser.id));
    }
  }, [isEmployee, currentUser]);

  // Compute duration in days if valid
  const calculateDays = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return -1;
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysCount = calculateDays(startDate, endDate);
  const editDaysCount = calculateDays(editStartDate, editEndDate);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetEmployeeId = isEmployee ? currentUser.id : employeeId;

    if (!targetEmployeeId) {
      showToast({ type: 'error', title: 'Missing Field', message: 'Please select an employee.' });
      return;
    }
    if (!startDate || !endDate) {
      showToast({ type: 'error', title: 'Missing Dates', message: 'Both start and end dates are required.' });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'End date cannot be prior to start date.',
      });
      return;
    }

    try {
      setSubmitting(true);
      await leaveService.submit({
        employeeId: Number(targetEmployeeId),
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      showToast({
        type: 'success',
        title: 'Application Submitted!',
        message: 'Your leave application has been submitted and is now queued for admin review.',
      });

      // Reset form
      setReason('');
      setStartDate('');
      setEndDate('');
      onLeaveSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0] || 'Failed to submit leave request.';
      showToast({ type: 'error', title: 'Submission Failed', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditLeave = (leave) => {
    setEditingLeave(leave);
    setEditLeaveType(leave.leaveType);
    setEditStartDate(leave.startDate);
    setEditEndDate(leave.endDate);
    setEditReason(leave.reason || '');
  };

  const handleUpdateLeave = async (e) => {
    e.preventDefault();
    if (!editStartDate || !editEndDate) {
      showToast({ type: 'error', title: 'Missing Dates', message: 'Both start and end dates are required.' });
      return;
    }
    if (new Date(editEndDate) < new Date(editStartDate)) {
      showToast({ type: 'error', title: 'Invalid Dates', message: 'End date cannot be prior to start date.' });
      return;
    }

    try {
      setUpdatingLeave(true);
      await leaveService.update(editingLeave.id, {
        employeeId: editingLeave.employeeId,
        leaveType: editLeaveType,
        startDate: editStartDate,
        endDate: editEndDate,
        reason: editReason.trim(),
      });

      showToast({
        type: 'success',
        title: 'Application Updated',
        message: 'Leave application details have been successfully modified.',
      });

      setEditingLeave(null);
      onLeaveSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update leave application.';
      showToast({ type: 'error', title: 'Update Failed', message: msg });
    } finally {
      setUpdatingLeave(false);
    }
  };

  const handleCancelLeave = async (leave) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave application?')) {
      return;
    }

    try {
      setCancellingId(leave.id);
      await leaveService.delete(leave.id);
      showToast({
        type: 'success',
        title: 'Application Cancelled',
        message: 'Pending leave request has been cancelled and removed.',
      });
      onLeaveSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel leave request.';
      showToast({ type: 'error', title: 'Cancellation Failed', message: msg });
    } finally {
      setCancellingId(null);
    }
  };

  const displayedLeaves = isEmployee
    ? leaves.filter((l) => l.employeeId === currentUser?.id || l.employeeEmail === currentUser?.email)
    : leaves;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isEmployee ? 'Submit Leave Application' : 'Apply for Leave'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isEmployee
            ? `Logged in as ${currentUser?.name}. Submit new requests or edit pending submissions below.`
            : 'Submit leave requests for employees and review live submission history.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/90 h-fit">
          <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100 text-indigo-600">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Send className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Leave Application Form</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isEmployee ? 'Personal Leave Request' : 'Admin Submissions'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Applicant / Employee <span className="text-rose-500">*</span>
              </label>

              {isEmployee ? (
                /* Locked Profile Badge for Logged-in Employee */
                <div className="p-3 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {currentUser?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'E'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {currentUser?.department} &bull; {currentUser?.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Logged In
                  </span>
                </div>
              ) : (
                /* Select Dropdown for Admin */
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/90 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition outline-none"
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &bull; {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Leave Type Radio Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Leave Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ANNUAL', label: 'Annual' },
                  { id: 'CASUAL', label: 'Casual' },
                  { id: 'MEDICAL', label: 'Medical' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLeaveType(t.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      leaveType === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                  required
                />
              </div>
            </div>

            {/* Duration calculation banner */}
            {daysCount !== null && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 animate-slide-up ${
                  daysCount === -1
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-indigo-50/80 text-indigo-800 border border-indigo-100 font-medium'
                }`}
              >
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>
                  {daysCount === -1
                    ? 'Invalid: End date must be on or after start date.'
                    : `Total Duration: ${daysCount} ${daysCount === 1 ? 'calendar day' : 'calendar days'}`}
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason / Justification
              </label>
              <textarea
                rows={3}
                placeholder="State the reason for this leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || daysCount === -1}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Submissions Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {isEmployee ? 'My Submissions' : 'Submitted Leave History'}
              </h3>
              <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {displayedLeaves.length} records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Reason & Notes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      {isEmployee
                        ? "You haven't submitted any leave requests yet."
                        : 'No leave requests submitted yet.'}
                    </td>
                  </tr>
                ) : (
                  displayedLeaves.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">{item.employeeName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.department}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 text-[11px] rounded-md font-bold bg-slate-100 text-slate-700">
                          {item.leaveType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-700 font-medium">
                        <div className="flex items-center space-x-1">
                          <span>{item.startDate}</span>
                          <span className="text-slate-400">➔</span>
                          <span>{item.endDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-500 max-w-xs">
                        <div className="truncate">{item.reason || <span className="text-slate-300 italic">—</span>}</div>
                        {item.rejectionReason && (
                          <div className="mt-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                            <strong>Note:</strong> {item.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {item.status === 'PENDING' ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleStartEditLeave(item)}
                              title="Edit Leave Request"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCancelLeave(item)}
                              disabled={cancellingId === item.id}
                              title="Cancel Request"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Leave Modal */}
      {editingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Leave Request</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{editingLeave.employeeName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingLeave(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLeave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Leave Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ANNUAL', label: 'Annual' },
                    { id: 'CASUAL', label: 'Casual' },
                    { id: 'MEDICAL', label: 'Medical' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditLeaveType(t.id)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                        editLeaveType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                    required
                  />
                </div>
              </div>

              {editDaysCount !== null && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                    editDaysCount === -1
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-indigo-50/80 text-indigo-800 border border-indigo-100 font-medium'
                  }`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {editDaysCount === -1
                      ? 'Invalid: End date must be on or after start date.'
                      : `Total Duration: ${editDaysCount} ${editDaysCount === 1 ? 'calendar day' : 'calendar days'}`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Justification
                </label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLeave(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingLeave || editDaysCount === -1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updatingLeave ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
        Approved
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
      Pending
    </span>
  );
}
