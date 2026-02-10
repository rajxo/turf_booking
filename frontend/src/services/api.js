import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on 401 if we're on auth pages or making auth requests
        const isAuthRequest = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Turf API
export const turfAPI = {
    getAll: (params) => api.get('/turfs', { params }),
    getById: (id) => api.get(`/turfs/${id}`),
    getCities: () => api.get('/turfs/cities'),
    getSportsTypes: () => api.get('/turfs/sports-types'),
    create: (data) => api.post('/turfs', data),
    update: (id, data) => api.put(`/turfs/${id}`, data),
    delete: (id) => api.delete(`/turfs/${id}`),
    getMyTurfs: () => api.get('/turfs/my-turfs'),
    uploadCoverImage: (id, formData) =>
        api.post(`/turfs/${id}/cover-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    uploadGalleryImages: (id, formData) =>
        api.post(`/turfs/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deleteGalleryImage: (id, index) => api.delete(`/turfs/${id}/images/${index}`),
};

// Booking API
export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/my-bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    getTurfBookings: (turfId) => api.get(`/bookings/turf/${turfId}`),
    getAvailability: (turfId, date) =>
        api.get(`/bookings/availability/${turfId}`, { params: { date } }),
};

// Review API
export const reviewAPI = {
    create: (data) => api.post('/reviews', data),
    getTurfReviews: (turfId, params) => api.get(`/reviews/turf/${turfId}`, { params }),
    getMyReviews: () => api.get('/reviews/my-reviews'),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getTurfs: (params) => api.get('/admin/turfs', { params }),
    approveTurf: (id) => api.put(`/admin/turfs/${id}/approve`),
    rejectTurf: (id, reason) => api.put(`/admin/turfs/${id}/reject`, { reason }),
    getBookingReport: (params) => api.get('/admin/reports/bookings', { params }),
};

export default api;
