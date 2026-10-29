import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Send, User } from 'lucide-react';
import { leaveService } from '../services/api';

export default function LeaveApplicationSection({ employees, leaves, onLeaveSubmitted }) {
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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
    setFeedback({ type: '', message: '' });

    if (!employeeId) {
      setFeedback({ type: 'error', message: 'Please select an employee.' });
      return;
    }
    if (!startDate || !endDate) {
      setFeedback({ type: 'error', message: 'Both start date and end date are required.' });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFeedback({
        type: 'error',
        message: 'Invalid Date Range: End date cannot be before start date.',
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

      setFeedback({
        type: 'success',
        message: 'Leave application submitted successfully! It is now pending admin approval.',
      });

      // Reset form
      setReason('');
      setStartDate('');
      setEndDate('');
      onLeaveSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0] || 'Failed to submit leave request.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Apply for Leave</h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit your leave requests for administrator review and track their approval status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Leave Submission Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
            <Send className="w-5 h-5" />
            <h3 className="font-semibold text-slate-800">Leave Request Form</h3>
          </div>

          {feedback.message && (
            <div
              className={`p-3 rounded-lg text-sm mb-4 flex items-start space-x-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Leave Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['ANNUAL', 'CASUAL', 'MEDICAL'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLeaveType(type)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      leaveType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Validation Feedback & Duration Summary */}
            {daysCount !== null && (
              <div
                className={`text-xs px-3 py-2 rounded-lg flex items-center justify-between ${
                  daysCount === -1
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}
              >
                {daysCount === -1 ? (
                  <span className="flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Error: End date is before start date!</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Calculated Duration:</span>
                  </span>
                )}
                {daysCount !== -1 && (
                  <span className="font-bold text-xs">{daysCount} day{daysCount > 1 ? 's' : ''}</span>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Reason / Remarks
              </label>
              <textarea
                rows="3"
                placeholder="Briefly state your purpose of leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || daysCount === -1}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Submitted Leaves Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Recent Leave Requests</h3>
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {leaves.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-medium">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {item.employeeName}
                        <div className="text-xs text-slate-400 font-normal">{item.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-xs rounded font-medium bg-slate-100 text-slate-700">
                          {item.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        <div>{item.startDate} to {item.endDate}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 max-w-xs truncate">
                        {item.reason || '—'}
                      </td>
                      <td className="py-3 px-3">
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        Approved
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      Pending
    </span>
  );
}

