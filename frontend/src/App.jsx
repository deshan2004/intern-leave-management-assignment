import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import LeaveApplicationSection from './components/LeaveApplicationSection';
import EmployeeSection from './components/EmployeeSection';
import Toast from './components/Toast';
import { employeeService, leaveService } from './services/api';
import { Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['admin', 'apply', 'employees'].includes(tabParam)) {
      return tabParam;
    }
    return 'admin';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
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

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center justify-between text-rose-800 text-xs shadow-sm animate-slide-up">
            <span className="font-medium">{error}</span>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
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
            {activeTab === 'admin' && (
              <AdminDashboard
                leaves={leaves}
                onActionCompleted={fetchData}
                showToast={showToast}
              />
            )}

            {activeTab === 'apply' && (
              <LeaveApplicationSection
                employees={employees}
                leaves={leaves}
                onLeaveSubmitted={fetchData}
                showToast={showToast}
              />
            )}

            {activeTab === 'employees' && (
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

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="font-medium">
            Employee Leave Management System &bull; Omibits (Pvt) Ltd. Technical Assessment
          </div>
          <div className="text-slate-400">
            Crafted with Spring Boot 3 &amp; React (Vite + Tailwind CSS)
          </div>
        </div>
      </footer>
    </div>
  );
}
