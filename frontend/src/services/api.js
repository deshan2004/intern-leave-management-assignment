import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};

export const employeeService = {
  getAll: async () => {
    const res = await api.get('/employees');
    return res.data;
  },
  create: async (employeeData) => {
    const res = await api.post('/employees', employeeData);
    return res.data;
  },
  update: async (id, employeeData) => {
    const res = await api.put(`/employees/${id}`, employeeData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
};

export const leaveService = {
  getAll: async () => {
    const res = await api.get('/leaves');
    return res.data;
  },
  submit: async (leaveData) => {
    const res = await api.post('/leaves', leaveData);
    return res.data;
  },
  update: async (id, leaveData) => {
    const res = await api.put(`/leaves/${id}`, leaveData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/leaves/${id}`);
    return res.data;
  },
  approve: async (id) => {
    const res = await api.patch(`/leaves/${id}/approve`);
    return res.data;
  },
  reject: async (id, rejectionReason) => {
    const res = await api.patch(`/leaves/${id}/reject`, { rejectionReason });
    return res.data;
  },
};

export default api;
