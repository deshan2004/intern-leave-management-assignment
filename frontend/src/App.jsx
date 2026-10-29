import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import LeaveApplicationSection from './components/LeaveApplicationSection';
import EmployeeSection from './components/EmployeeSection';
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-sm">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading && employees.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Connecting to backend APIs...</p>
          </div>
        ) : (
          <>
            {activeTab === 'admin' && (
              <AdminDashboard
                leaves={leaves}
                onActionCompleted={fetchData}
              />
            )}

            {activeTab === 'apply' && (
              <LeaveApplicationSection
                employees={employees}
                leaves={leaves}
                onLeaveSubmitted={fetchData}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeSection
                employees={employees}
                onEmployeeAdded={fetchData}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Employee Leave Management System &bull; Omibits (Pvt) Ltd. Technical Assessment
          </div>
          <div>
            Built with Spring Boot 3 (Java 21) & React (Tailwind CSS)
          </div>
        </div>
      </footer>
    </div>
  );
}

