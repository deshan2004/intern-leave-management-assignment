import React, { useState } from 'react';
import { CalendarCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginScreen({ employees, onLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);

    // 1. Check if Administrator
    if (cleanEmail === 'admin@omibits.com' || cleanEmail === 'admin') {
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
      setSubmitting(false);
      return;
    }

    // 2. Query against real Database Employees
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
        message: `Signed in to employee workspace (${matchedEmployee.department}).`,
      });
    } else {
      // Email not found in Database
      setErrorMessage(
        `Invalid credentials. No active employee account found for "${cleanEmail}".`
      );
    }

    setSubmitting(false);
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
            Sign in with your corporate credentials to access your workspace
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/90 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2 animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@omibits.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 transition"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-bold rounded-xl text-xs shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-400 font-medium">
          &copy; 2026 Omibits (Pvt) Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}
