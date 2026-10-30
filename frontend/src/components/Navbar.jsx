import React from 'react';
import { CalendarCheck, Users, Shield, Send, LogOut, User, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingCount, currentUser, onLogout, onSwitchRole }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  const adminTabs = [
    { id: 'admin', label: 'Admin Approvals', icon: Shield, badge: pendingCount },
    { id: 'employees', label: 'Employees', icon: Users },
  ];

  const employeeTabs = [
    { id: 'apply', label: 'Apply for Leave', icon: Send },
    { id: 'myleaves', label: 'My Submissions', icon: CalendarCheck },
  ];

  const visibleTabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company branding */}
          <div
            className="flex items-center space-x-3.5 group cursor-pointer"
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'apply')}
          >
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
            {visibleTabs.map((tab) => {
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

          {/* User Profile & Role Switcher / Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-sm">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAdmin ? 'bg-slate-900 text-amber-400' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isAdmin ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  currentUser?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                  <span>{isAdmin ? 'System Admin' : currentUser?.department || 'Employee'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Switch user or log out"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-all duration-150 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Switch</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
