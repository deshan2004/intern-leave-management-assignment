import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Send, User, Sparkles, ArrowRight } from 'lucide-react';
import { leaveService } from '../services/api';

export default function LeaveApplicationSection({ employees, leaves, onLeaveSubmitted, showToast }) {
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute duration in days if valid
  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return -1;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysCount = calculateDays();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
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
        employeeId: Number(employeeId),
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Apply for Leave</h2>
        <p className="text-xs text-slate-500 mt-1">
          Submit your leave requests for administrator review and track their approval status.
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
              <h3 className="font-bold text-sm text-slate-900">Leave Application</h3>
              <p className="text-[11px] text-slate-400 font-medium">Fill in all required fields</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Employee <span className="text-rose-500">*</span>
              </label>
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
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Leave Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ANNUAL', label: 'Annual' },
                  { id: 'CASUAL', label: 'Casual' },
                  { id: 'MEDICAL', label: 'Medical' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLeaveType(type.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      leaveType === type.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Validation Feedback & Duration Indicator */}
            {daysCount !== null && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  daysCount === -1
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                    : 'bg-indigo-50/80 text-indigo-900 border-indigo-100 shadow-sm'
                }`}
              >
                {daysCount === -1 ? (
                  <span className="flex items-center space-x-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Error: End date is before start date!</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Calculated Duration:</span>
                  </span>
                )}
                {daysCount !== -1 && (
                  <span className="font-extrabold text-xs px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                    {daysCount} day{daysCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason / Purpose
              </label>
              <textarea
                rows="3"
                placeholder="State your reason clearly (e.g. medical recovery, family commitment)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || daysCount === -1}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Submitted Leaves Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Submitted Leave History</h3>
              <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {leaves.length} records
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
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((item) => (
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
                      <td className="py-3.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                        {item.reason || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
