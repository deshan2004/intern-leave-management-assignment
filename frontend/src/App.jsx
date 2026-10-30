import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import LeaveApplicationSection from './components/LeaveApplicationSection';
import EmployeeSection from './components/EmployeeSection';
import LoginScreen from './components/LoginScreen';
import Toast from './components/Toast';
import { employeeService, leaveService } from './services/api';
import { Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem('leave_portal_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activeTab, setActiveTabState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['admin', 'apply', 'employees', 'myleaves'].includes(tabParam)) {
      return tabParam;
    }
    return currentUser?.role === 'EMPLOYEE' ? 'apply' : 'admin';
  });

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  const closeToast = () => {
    setToast(null);
  };

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('leave_portal_user', JSON.stringify(user));
    } catch (e) {}
    setActiveTab(user.role === 'ADMIN' ? 'admin' : 'apply');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('leave_portal_user');
    } catch (e) {}
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Session closed. Select a role or log in again to continue.',
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [empData, leavesData] = await Promise.all([
        employeeService.getAll(),
        leaveService.getAll(),
      ]);
      setEmployees(empData);
      setLeaves(leavesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to connect to backend server. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ensure non-admins and admins stay on their respective authorized tabs
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      if (activeTab === 'apply' || activeTab === 'myleaves') {
        setActiveTab('admin');
      }
    } else if (currentUser?.role === 'EMPLOYEE') {
      if (activeTab === 'admin' || activeTab === 'employees') {
        setActiveTab('apply');
      }
    }
  }, [currentUser, activeTab]);

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  // If user is not signed in, show the sleek Login & Role Selection view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900/5 selection:bg-indigo-500 selection:text-white">
        <LoginScreen
          employees={employees}
          onLogin={handleLogin}
          showToast={showToast}
        />
        <Toast toast={toast} onClose={closeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glass Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-sky-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 glass-panel border border-rose-200/90 rounded-2xl flex items-center justify-between text-rose-800 text-xs shadow-sm animate-slide-up">
              <span className="font-semibold">{error}</span>
              <button
                onClick={fetchData}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition flex items-center space-x-1.5 shadow-md shadow-rose-600/20 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {loading && employees.length === 0 ? (
            <div className="py-28 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">Connecting to Backend API...</p>
            </div>
          ) : (
            <>
              {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
                <AdminDashboard
                  leaves={leaves}
                  onActionCompleted={fetchData}
                  showToast={showToast}
                />
              )}

              {(activeTab === 'apply' || activeTab === 'myleaves') && (
                <LeaveApplicationSection
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  employees={employees}
                  leaves={leaves}
                  onLeaveSubmitted={fetchData}
                  showToast={showToast}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'employees' && currentUser.role === 'ADMIN' && (
                <EmployeeSection
                  employees={employees}
                  onEmployeeAdded={fetchData}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>

        {/* Floating Interactive Toast */}
        <Toast toast={toast} onClose={closeToast} />

        <footer className="glass-panel border-t border-slate-200/80 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="font-semibold">
              Employee Leave Management System &bull; Omibits (Pvt) Ltd.
            </div>
            <div className="text-slate-400">
              &copy; 2026 Omibits. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
