import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Mail,
  Building,
  Search,
  Lock,
  Pencil,
  Trash2,
  X,
  Check,
  Save,
  Filter,
} from 'lucide-react';
import { employeeService } from '../services/api';

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance & Operations',
  'Marketing',
  'Product Design',
];

export default function EmployeeSection({ employees, onEmployeeAdded, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('password123');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('Engineering');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Employee name is required.' });
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      showToast({ type: 'error', title: 'Invalid Email', message: 'A valid email address is required.' });
      return;
    }

    try {
      setSubmitting(true);
      await employeeService.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        password: password.trim() || 'password123',
      });

      showToast({
        type: 'success',
        title: 'Employee Registered!',
        message: `${name.trim()} was successfully registered to ${department}.`,
      });

      setName('');
      setEmail('');
      setPassword('password123');
      setDepartment('Engineering');
      onEmployeeAdded();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0] || 'Failed to create employee.';
      showToast({ type: 'error', title: 'Registration Failed', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditDepartment(emp.department);
    setEditPassword('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editName.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Employee name is required.' });
      return;
    }
    if (!editEmail.trim() || !validateEmail(editEmail.trim())) {
      showToast({ type: 'error', title: 'Invalid Email', message: 'A valid email address is required.' });
      return;
    }

    try {
      setUpdating(true);
      await employeeService.update(editingEmployee.id, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        department: editDepartment.trim(),
        password: editPassword.trim() || undefined,
      });

      showToast({
        type: 'success',
        title: 'Employee Updated',
        message: `${editName.trim()}'s profile was updated successfully.`,
      });

      setEditingEmployee(null);
      onEmployeeAdded();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update employee.';
      showToast({ type: 'error', title: 'Update Failed', message: msg });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Are you sure you want to remove ${emp.name}? Any associated leave records will also be removed.`)) {
      return;
    }

    try {
      setDeletingId(emp.id);
      await employeeService.delete(emp.id);
      showToast({
        type: 'success',
        title: 'Employee Removed',
        message: `${emp.name} has been removed from the directory.`,
      });
      onEmployeeAdded();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete employee.';
      showToast({ type: 'error', title: 'Delete Failed', message: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register new personnel across all 5 company departments, manage credentials, and oversee the roster.
          </p>
        </div>

        {/* 5 Departments Badge Pill */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-[11px] font-bold text-blue-900 shadow-sm">
          <Building className="w-3.5 h-3.5 text-blue-600" />
          <span>5 Corporate Departments</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Register Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm h-fit">
          <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100 text-blue-600">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Personnel</h3>
              <p className="text-[11px] text-slate-400 font-medium">Create staff profile & credentials</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kasun Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="kasun@omibits.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Department <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Choose 1 of 5</span>
              </div>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition cursor-pointer font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">For employee login</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. password123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Registering...' : 'Register Employee'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Employees List Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-2 text-slate-800">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Registered Personnel</h3>
              <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {filteredEmployees.length} of {employees.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Department Filter */}
              <div className="relative w-full sm:w-44">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  placeholder="Search name/email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      No employees match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 font-extrabold flex items-center justify-center text-[11px] shadow-sm">
                            {emp.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 font-medium">
                        {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleStartEdit(emp)}
                            title="Edit Employee"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            disabled={deletingId === emp.id}
                            title="Delete Employee"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Employee Profile</h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition cursor-pointer font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    New Password
                  </label>
                  <span className="text-[10px] text-slate-400">Leave blank to keep unchanged</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter new password to change..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
