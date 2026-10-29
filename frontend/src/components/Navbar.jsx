import React from 'react';
import { CalendarCheck, Users, Shield, Send, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingCount }) {
  const tabs = [
    { id: 'admin', label: 'Admin Approvals', icon: Shield, badge: pendingCount },
    { id: 'apply', label: 'Apply for Leave', icon: Send },
    { id: 'employees', label: 'Employees', icon: Users },
  ];

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company branding */}
          <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => setActiveTab('admin')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base flex items-center space-x-2">
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  Omibits
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Leave Management System</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/50 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
