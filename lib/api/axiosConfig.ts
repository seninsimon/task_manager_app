import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update with your backend URL (use your computer's IP address for physical devices)
const API_URL = 'http://192.168.1.6:3002/'; // Change this!

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;