import React from 'react';
import { X, FileText, Download, CheckCircle, XCircle, ExternalLink, Paperclip } from 'lucide-react';

export default function DocumentModal({ isOpen, onClose, leaveRequest, onApprove, onReject, isAdmin }) {
  if (!isOpen || !leaveRequest || !leaveRequest.attachmentData) return null;

  const isImage =
    leaveRequest.attachmentType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(leaveRequest.attachmentName || '');

  const isPdf =
    leaveRequest.attachmentType === 'application/pdf' ||
    /\.pdf$/i.test(leaveRequest.attachmentName || '');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = leaveRequest.attachmentData;
    link.download = leaveRequest.attachmentName || 'supporting-document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-sm">
                {leaveRequest.attachmentName || 'Supporting Attachment'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {leaveRequest.employeeName} &bull; {leaveRequest.leaveType} Leave
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex items-center space-x-1 text-xs font-semibold"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/60 flex items-center justify-center">
          {isImage ? (
            <div className="max-h-[60vh] flex items-center justify-center">
              <img
                src={leaveRequest.attachmentData}
                alt={leaveRequest.attachmentName}
                className="max-h-[58vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200 bg-white"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[58vh] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
              <iframe
                src={leaveRequest.attachmentData}
                title={leaveRequest.attachmentName}
                className="w-full flex-1 border-0"
              />
            </div>
          ) : (
            <div className="py-16 px-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
              <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">{leaveRequest.attachmentName}</h4>
              <p className="text-xs text-slate-500 mb-4">
                This file format can be downloaded and opened with your system viewer.
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition inline-flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Attachment</span>
              </button>
            </div>
          )}
        </div>

        {/* Leave Context & Quick Action Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 text-left w-full sm:w-auto">
            <span className="font-semibold text-slate-800">Reason:</span>{' '}
            <span className="italic">{leaveRequest.reason || 'None provided'}</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {isAdmin && leaveRequest.status === 'PENDING' && onApprove && onReject ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onReject(leaveRequest);
                  }}
                  className="px-3.5 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject / Suggest</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onApprove(leaveRequest);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Leave</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

