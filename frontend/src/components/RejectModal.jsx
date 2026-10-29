import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function RejectModal({ isOpen, onClose, onConfirm, leaveRequest }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !leaveRequest) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a constructive reason for rejecting this leave request.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirm(leaveRequest.id, reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/80 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-100">
          <div className="flex items-center space-x-2.5 text-rose-700">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Reject Leave Application</h3>
              <p className="text-[11px] text-slate-500 font-medium">Ref #{leaveRequest.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Employee:</span>
              <span className="font-bold text-slate-800">{leaveRequest.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Requested Period:</span>
              <span className="font-semibold text-slate-700">{leaveRequest.startDate} ➔ {leaveRequest.endDate}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rejection Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs text-slate-800 transition outline-none"
              placeholder="e.g. Critical release scheduled during this sprint, insufficient advance notice..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              required
            />
            {error && <p className="text-[11px] text-rose-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/25 transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{submitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
