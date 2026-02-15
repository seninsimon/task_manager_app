import axiosInstance from './axiosConfig';

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => 
    axiosInstance.post('/auth/register', data),
  login: (data: { email: string; password: string }) => 
    axiosInstance.post('/auth/login', data),
};

export const tasksAPI = {
  getAll: () => axiosInstance.get('api/tasks'),
  create: (data: { title: string }) => axiosInstance.post('api/tasks', data),
  update: (id: number, data: { title?: string; status?: string }) => 
    axiosInstance.put(`api/tasks/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`api/tasks/${id}`),
};