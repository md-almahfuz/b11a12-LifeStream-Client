// src/api/axiosInstance.js
import axios from 'axios';
import { getAuth } from 'firebase/auth'; // Import getAuth from firebase/auth

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL


const axiosInstance = axios.create({
    baseURL: SERVER_URL,
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor to attach the Firebase ID token
axiosInstance.interceptors.request.use(
    async (config) => {
        const auth = getAuth(); // Get the Firebase Auth instance
        const user = auth.currentUser; // Get the current authenticated user

        if (user) {
            try {
                const token = await user.getIdToken(); // Get the Firebase ID token
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Error getting Firebase ID token:", error);
                // Handle error: perhaps redirect to login or throw
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Response interceptor for error handling (e.g., 401 errors)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid on server side.
            // You might want to force a re-login or clear local state.
            console.error("Authentication failed or token expired. Redirecting to login.");
            // Example: If using react-router-dom, you might use a redirect here,
            // but in an interceptor, it's better to let components handle it or
            // use a global error handler for a smooth UX.
            // E.g., a global event or context provider that triggers logout.
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;