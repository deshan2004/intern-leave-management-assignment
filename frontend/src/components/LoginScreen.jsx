import React, { useState } from 'react';
import { CalendarCheck, Shield, User, ArrowRight, Lock, Mail, Sparkles, Building, CheckCircle2 } from 'lucide-react';

export default function LoginScreen({ employees, onLogin, showToast }) {
  const [email, setEmail] = useState('admin@omibits.com');
  const [password, setPassword] = useState('admin123');
  const [selectedDemo, setSelectedDemo] = useState('admin');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Check if admin
    if (cleanEmail === 'admin@omibits.com' || cleanEmail.includes('admin')) {
      const adminUser = {
        id: 0,
        name: 'System Administrator',
        email: 'admin@omibits.com',
        role: 'ADMIN',
        department: 'Operations & Management',
      };
      onLogin(adminUser);
      showToast({
        type: 'success',
        title: 'Signed in as Administrator',
        message: 'Welcome back! You have full access to reviews and approvals.',
      });
      return;
    }

    // Check if matched employee
    const matchedEmployee = employees.find(
      (emp) => emp.email.toLowerCase() === cleanEmail
    );

    if (matchedEmployee) {
      const empUser = {
        ...matchedEmployee,
        role: 'EMPLOYEE',
      };
      onLogin(empUser);
      showToast({
        type: 'success',
        title: `Welcome, ${matchedEmployee.name}`,
        message: `Signed in as an employee in ${matchedEmployee.department}.`,
      });
    } else {
      // If entered a custom employee email that is not in demo list yet
      const fallbackEmp = {
        id: 999,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        role: 'EMPLOYEE',
        department: 'Engineering',
      };
      onLogin(fallbackEmp);
      showToast({
        type: 'info',
        title: 'Signed in as Employee',
        message: `Session initialized for ${cleanEmail}.`,
      });
    }
  };

  const handleSelectDemo = (type, empData = null) => {
    setSelectedDemo(type);
    if (type === 'admin') {
      setEmail('admin@omibits.com');
      setPassword('admin123');
      const adminUser = {
        id: 0,
        name: 'System Administrator',
        email: 'admin@omibits.com',
        role: 'ADMIN',
        department: 'Management',
      };
      onLogin(adminUser);
      showToast({
        type: 'success',
        title: 'Logged in as Administrator',
        message: 'Admin approval privileges active.',
      });
    } else if (empData) {
      setEmail(empData.email);
      setPassword('password123');
      const empUser = {
        ...empData,
        role: 'EMPLOYEE',
      };
      onLogin(empUser);
      showToast({
        type: 'success',
        title: `Logged in as ${empData.name}`,
        message: `Employee workspace active (${empData.department}).`,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md w-full space-y-6 animate-scale-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-2">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Omibits Leave Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage leave applications and administrative reviews
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/90 space-y-6">
          {/* Quick Demo Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Quick Demo Accounts</span>
              <span className="text-indigo-600 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>One-Click Login</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Admin Demo Button */}
              <button
                type="button"
                onClick={() => handleSelectDemo('admin')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-left transition-all duration-200 flex items-center justify-between group active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center space-x-1.5">
                      <span>Administrator</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">admin@omibits.com &bull; Approvals & Roster</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Employee Demos */}
              {employees.slice(0, 2).map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelectDemo('emp', emp)}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-left transition-all duration-200 flex items-center justify-between group active:scale-[0.99] shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                        <span>{emp.name}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                          {emp.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{emp.email} &bull; Employee Mode</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white/80 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider backdrop-blur-sm">
              or sign in with email
            </span>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@omibits.com or employee@omibits.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-bold rounded-xl text-xs shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Omibits (Pvt) Ltd. Technical Assessment &bull; Role-Based Access Control Prototype
        </div>
      </div>
    </div>
  );
}
