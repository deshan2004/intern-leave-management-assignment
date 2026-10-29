import React from 'react';
import { CalendarCheck, Users, Shield, Send } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingCount }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Omibits</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Leave Portal
                </span>
              </div>
              <div className="text-xs text-slate-500">Employee Leave Management System</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Approvals</span>
              {pendingCount > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('apply')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'apply'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'employees'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

