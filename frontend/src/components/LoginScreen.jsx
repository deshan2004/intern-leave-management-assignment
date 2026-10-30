import React, { useState } from 'react';
import { CalendarCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginScreen({ onLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
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

    try {
      setSubmitting(true);
      const authUser = await authService.login(cleanEmail, password.trim());
      onLogin(authUser);
      showToast({
        type: 'success',
        title: authUser.role === 'ADMIN' ? 'Signed in as Administrator' : `Welcome, ${authUser.name}`,
        message:
          authUser.role === 'ADMIN'
            ? 'Administrator privileges active.'
            : `Signed in to employee workspace (${authUser.department}).`,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Cannot connect to backend server. Please verify Spring Boot is running on port 8080.'
          : 'Authentication failed. Invalid corporate email or password.');
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Dynamic Ambient Background Glass Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-violet-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10 animate-scale-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-2 transform hover:scale-105 transition-transform duration-300">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Omibits Leave Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in with your corporate credentials to access your workspace
          </p>
        </div>

        {/* Glass Login Form Card */}
        <div className="glass-panel p-7 sm:p-9 rounded-3xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl text-rose-700 text-xs flex items-start space-x-2 animate-slide-up shadow-sm">
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
                  className="w-full pl-9 pr-3 py-2.5 text-xs glass-input rounded-xl outline-none font-medium text-slate-800 transition"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs glass-input rounded-xl outline-none font-medium text-slate-800 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 rounded-lg focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-950 hover:to-slate-900 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-slate-900/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
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
