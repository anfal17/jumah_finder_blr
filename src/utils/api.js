import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
            const { token } = JSON.parse(adminInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
