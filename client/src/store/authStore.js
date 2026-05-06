import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ user: response.data.user, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
            return false;
        }
    },

    signup: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/auth/register', { username, email, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ user: response.data.user, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Signup failed', isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.get('/api/auth/me');
            set({ user: response.data });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null });
        }
    },
}));
