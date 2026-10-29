import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const employeeService = {
  getAll: async () => {
    const res = await api.get('/employees');
    return res.data;
  },
  create: async (employeeData) => {
    const res = await api.post('/employees', employeeData);
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

