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
  UploadCloud,
  Paperclip,
  PlusCircle,
  Inbox,
} from 'lucide-react';
import { leaveService } from '../services/api';
import DocumentModal from './DocumentModal';

export default function LeaveApplicationSection({
  activeTab = 'apply',
  setActiveTab,
  employees,
  leaves,
  onLeaveSubmitted,
  showToast,
  currentUser,
}) {
  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const [employeeId, setEmployeeId] = useState(
    isEmployee && currentUser?.id ? String(currentUser.id) : ''
  );
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [attachmentData, setAttachmentData] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Leave State
  const [editingLeave, setEditingLeave] = useState(null);
  const [editLeaveType, setEditLeaveType] = useState('ANNUAL');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editAttachmentName, setEditAttachmentName] = useState('');
  const [editAttachmentType, setEditAttachmentType] = useState('');
  const [editAttachmentData, setEditAttachmentData] = useState('');
  const [updatingLeave, setUpdatingLeave] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Document Viewer Modal
  const [viewingDocument, setViewingDocument] = useState(null);

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

  const handleFileChange = (e) => {
    setFileSizeError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileSizeError('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentName(file.name);
      setAttachmentType(file.type || 'application/octet-stream');
      setAttachmentData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentName('');
    setAttachmentType('');
    setAttachmentData('');
    setFileSizeError('');
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Maximum file size is 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditAttachmentName(file.name);
      setEditAttachmentType(file.type || 'application/octet-stream');
      setEditAttachmentData(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
        attachmentName: attachmentName.trim() || undefined,
        attachmentType: attachmentType || undefined,
        attachmentData: attachmentData || undefined,
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
      handleRemoveAttachment();
      onLeaveSubmitted();

      // Automatically navigate to "My Submissions" tab
      if (setActiveTab) {
        setActiveTab('myleaves');
      }
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
    setEditAttachmentName(leave.attachmentName || '');
    setEditAttachmentType(leave.attachmentType || '');
    setEditAttachmentData(leave.attachmentData || '');
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
        attachmentName: editAttachmentName.trim() || undefined,
        attachmentType: editAttachmentType || undefined,
        attachmentData: editAttachmentData || undefined,
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
    <div className="space-y-6 animate-fade-in">
      {/* View 1: Apply for Leave Form (Dedicated View) */}
      {activeTab === 'apply' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Submit Leave Application
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your leave dates, category, and attach any medical proof.
              </p>
            </div>
            {setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab('myleaves')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>My Submissions ({displayedLeaves.length})</span>
              </button>
            )}
          </div>

          <div className="glass-panel p-7 sm:p-8 rounded-3xl shadow-lg border border-slate-200/90 bg-white/95">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Card */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Applicant Profile
                </label>
                <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-600/25">
                      {currentUser?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'E'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{currentUser?.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {currentUser?.department} &bull; {currentUser?.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Logged In
                  </span>
                </div>
              </div>

              {/* Leave Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Leave Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ANNUAL', label: 'Annual Leave' },
                    { id: 'CASUAL', label: 'Casual Leave' },
                    { id: 'MEDICAL', label: 'Medical Leave' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeaveType(t.id)}
                      className={`py-3 px-3 text-xs font-bold rounded-2xl border transition-all text-center ${
                        leaveType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                    required
                  />
                </div>
              </div>

              {/* Duration calculation banner */}
              {daysCount !== null && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center space-x-2 animate-slide-up ${
                    daysCount === -1
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-indigo-50/90 text-indigo-900 border border-indigo-100 font-semibold'
                  }`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {daysCount === -1
                      ? 'Invalid date range: End date must be on or after start date.'
                      : `Total Duration: ${daysCount} ${daysCount === 1 ? 'calendar day' : 'calendar days'}`}
                  </span>
                </div>
              )}

              {/* Reason Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason / Justification
                </label>
                <textarea
                  rows={3}
                  placeholder="State the reason for this leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition resize-none"
                />
              </div>

              {/* Supporting Document / Medical Certificate Attachment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Supporting Document / Medical Proof
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Optional (Max 5MB)</span>
                </div>

                {leaveType === 'MEDICAL' && (
                  <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center space-x-2">
                    <Paperclip className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                    <span>A medical certificate or doctor prescription is recommended for medical leave.</span>
                  </div>
                )}

                {attachmentName ? (
                  <div className="flex items-center justify-between p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-semibold text-indigo-950 truncate">{attachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/30 group">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition mb-1.5" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition">
                      Click to upload medical slip or proof
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                {fileSizeError && <p className="text-[11px] text-rose-600 font-medium mt-1">{fileSizeError}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || daysCount === -1}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View 2: My Submissions History (Dedicated Full-Width View) */}
      {activeTab === 'myleaves' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                My Leave Submissions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track personal leave requests, view approval status, or modify pending applications.
              </p>
            </div>
            {setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Apply for New Leave</span>
              </button>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Duration & Dates</th>
                    <th className="py-3 px-4">Reason & Proof</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Inbox className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <p className="text-sm font-medium">You haven't submitted any leave requests yet.</p>
                          {setActiveTab && (
                            <button
                              onClick={() => setActiveTab('apply')}
                              className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Submit your first application &rarr;
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedLeaves.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 text-xs font-mono font-bold text-slate-400">
                          #{item.id}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 text-xs rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            {item.leaveType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-800 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.startDate}</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span>{item.endDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 max-w-xs">
                          <div className="truncate font-medium">{item.reason || <span className="text-slate-300 italic">&mdash;</span>}</div>

                          {item.attachmentName && (
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={() => setViewingDocument(item)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-[11px] font-semibold transition"
                              >
                                <Paperclip className="w-3 h-3 text-indigo-500" />
                                <span className="truncate max-w-[120px]">{item.attachmentName}</span>
                                <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1 py-0.2 rounded font-bold ml-1">
                                  View
                                </span>
                              </button>
                            </div>
                          )}

                          {item.rejectionReason && (
                            <div className="mt-1.5 text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100 leading-tight">
                              <strong>Admin Suggestion/Note:</strong> {item.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          {item.status === 'PENDING' ? (
                            <div className="flex items-center justify-end space-x-1.5">
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
                            <span className="text-[11px] font-medium text-slate-400 italic">Locked</span>
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
      )}

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
                  <p className="text-[10px] text-slate-500 font-medium">Ref #{editingLeave.id}</p>
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

              {/* Edit Attachment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attachment / Proof
                </label>
                {editAttachmentName ? (
                  <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                    <span className="font-semibold text-indigo-950 truncate max-w-[200px]">
                      {editAttachmentName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditAttachmentName('');
                        setEditAttachmentType('');
                        setEditAttachmentData('');
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 cursor-pointer bg-slate-50 text-xs text-slate-600 transition">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span>Upload new file</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                  </label>
                )}
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

      {/* Document Viewer Modal for Employee */}
      <DocumentModal
        isOpen={!!viewingDocument}
        leaveRequest={viewingDocument}
        onClose={() => setViewingDocument(null)}
        isAdmin={false}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Approved
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
      Pending
    </span>
  );
}
