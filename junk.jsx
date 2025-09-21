import React, { createContext, useState, useEffect } from 'react';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import app from '../firebase/firebase.config';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import axios from 'axios';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // New state for the user's role and role loading status
    const [userRole, setUserRole] = useState("donor");
    const [isRoleLoading, setIsRoleLoading] = useState(true);

    const fetchUserRole = async (idToken) => {
        try {
            const response = await axiosInstance.get('/get-user-role', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.data && response.data.role) {
                return response.data.role;
            } else {
                console.error("API response for user role is missing role data.");
                return "donor";
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            return "donor";
        }
    };

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logOut = () => {
        setLoading(true);
        // Clear user role and loading state on logout
        setUserRole("donor");
        setIsRoleLoading(true);
        return signOut(auth);
    };

    const updateUserProfile = (profileUpdates) => {
        return updateProfile(auth.currentUser, profileUpdates);
    };

    // Firebase Auth State Observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser); // Always set the user object first
            if (currentUser) {
                try {
                    const idToken = await currentUser.getIdToken();
                    const role = await fetchUserRole(idToken);
                    setUserRole(role); // Set the new userRole state
                } catch (error) {
                    console.error("Error during auth state change:", error);
                    setUserRole("donor"); // Default to donor on error
                } finally {
                    setIsRoleLoading(false); // Role is now loaded, even if it failed
                }
            } else {
                // If no user, reset the role state
                setUserRole("donor");
                setIsRoleLoading(false);
            }
            setLoading(false); // Auth loading is complete
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        userRole, // Expose the new userRole state
        isRoleLoading, // Expose the role loading state
        createUser,
        signIn,
        signInWithGoogle,
        logOut,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { FaUsers, FaMoneyBillWave, FaTint } from 'react-icons/fa';
import axios from 'axios';

const AdminDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonationsAmount: 0,
        totalRequests: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorFetchingStats, setErrorFetchingStats] = useState(false);

    useEffect(() => {
        const fetchAdminStats = async () => {
            if (loading || !user) return;

            setLoadingStats(true);
            setErrorFetchingStats(false);

            try {
                const idToken = await user.getIdToken();

                const usersResponse = await axiosInstance.get('/allusers-count', {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                const totalUsers = usersResponse.data.count || 0;

                const donationsResponse = await axiosInstance.get('/total-donations');
                const totalDonationsAmount = donationsResponse.data.totalAmount || 0;

                const requestsResponse = await axiosInstance.get('/all-donation-requests-count', {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                const totalRequests = requestsResponse.data.count || 0;

                setStats({ totalUsers, totalDonationsAmount, totalRequests });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    toast.error(`Failed to load admin stats: ${error.response.data.message}`);
                } else {
                    toast.error(`Failed to load admin stats: ${error.message}`);
                }
                setErrorFetchingStats(true);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchAdminStats();
    }, [user, loading]);

    // 🔹 Show spinner until Firebase + role check finishes
    if (loading) {
        return <Loading></Loading>
    }

    // 🔹 If not logged in
    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold">Please log in</h1>
            </div>
        );
    }

    // 🔹 If logged in but not admin
    if (user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
                <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
                    <h1 className="text-5xl font-extrabold text-red-600 mb-4">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-lg text-gray-600">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    // 🔹 Admin view
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">
                        Welcome, {user?.displayName || 'Admin'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Here's an overview of your LifeStream platform.
                    </p>
                </div>

                {loadingStats ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading dashboard statistics...</p>
                    </div>
                ) : errorFetchingStats ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>Could not load dashboard statistics. Please try again later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {/* Total Users */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaUsers className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
                            <p className="text-xl font-semibold mt-1">Total Users</p>
                        </div>

                        {/* Donations */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaMoneyBillWave className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">৳{stats.totalDonationsAmount.toLocaleString()}</h3>
                            <p className="text-xl font-semibold mt-1">Donations Collected</p>
                        </div>

                        {/* Requests */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaTint className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">{stats.totalRequests}</h3>
                            <p className="text-xl font-semibold mt-1">Donation Requests</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router";
import DashboardSidebar from "../components/DashboardSidebar";
import { FaSignOutAlt, FaDonate } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will exit your dashboard and take you to the secure Donate Money Portal.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, proceed!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Navigate to the donate page if the user confirms
                navigate('/auth/donate');
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-red-50">
            {/* Sidebar with a complementary background color */}
            <aside className="w-64 bg-white shadow-lg p-5 hidden md:flex flex-col">
                <Link to="/" className="block text-center mb-10">
                    <img
                        src="/resources/LifeStream.png"
                        alt="LifeStream Logo"
                        className="w-40 h-25 mx-auto mb-4 rounded-full object-cover"
                    />
                    <div className="text-2xl font-bold text-blue-600">
                        LifeStream
                    </div>
                </Link>

                {/* This div will push the buttons to the bottom */}
                <div className="flex-1">
                    <DashboardSidebar />
                </div>

                {/* --- Donate and Exit Portal buttons --- */}
                <div className="pt-4 border-t border-gray-200">
                    {/* Donate Money button */}
                    <button
                        onClick={handleDonateClick}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-blue-600 hover:bg-blue-100 transition-colors duration-200 w-full mb-2"
                    >
                        <FaDonate size={20} /> Donate Money
                    </button>

                    {/* Exit Portal Link */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt size={20} /> Exit Portal
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { RouterProvider } from 'react-router'
import Router from './routes/Router.jsx'
import { ToastContainer } from 'react-toastify'
import AuthProvider from './provider/AuthProvider.jsx'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* The AuthProvider component is used to provide authentication context to the application */}
        <AuthProvider>
            {/* The RouterProvider component is used to provide the router to the application */}
            <RouterProvider router={Router}></RouterProvider>
            {/* The ToastContainer component is used to display toast notifications */}
            <ToastContainer></ToastContainer>
        </AuthProvider>
    </StrictMode>,
)


import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router";
import DashboardSidebar from "../components/DashboardSidebar";
import { FaSignOutAlt, FaDonate } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will exit your dashboard and take you to the secure Donate Money Portal.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, proceed!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Navigate to the donate page if the user confirms
                navigate('/auth/donate');
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-red-50">
            {/* Sidebar with a complementary background color */}
            <aside className="w-64 bg-white shadow-lg p-5 hidden md:flex flex-col">
                <Link to="/" className="block text-center mb-10">
                    <img
                        src="/resources/LifeStream.png"
                        alt="LifeStream Logo"
                        className="w-40 h-25 mx-auto mb-4 rounded-full object-cover"
                    />
                    <div className="text-2xl font-bold text-blue-600">
                        LifeStream
                    </div>
                </Link>

                {/* This div will push the buttons to the bottom */}
                <div className="flex-1">
                    <DashboardSidebar />
                </div>

                {/* --- Donate and Exit Portal buttons --- */}
                <div className="pt-4 border-t border-gray-200">
                    {/* Donate Money button */}
                    <button
                        onClick={handleDonateClick}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-blue-600 hover:bg-blue-100 transition-colors duration-200 w-full mb-2"
                    >
                        <FaDonate size={20} /> Donate Money
                    </button>

                    {/* Exit Portal Link */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt size={20} /> Exit Portal
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;

import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane } from 'react-icons/fa'; // Added FaPaperPlane import

const Register = () => {
    const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { createUser, setUser, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '',
        password: '',
        confirmPassword: '',
        bloodGroup: '',
        district: '',
        upazila: '',
    });

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for location data
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // State for terms and conditions
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [termsError, setTermsError] = useState('');

    // Load districts and upazilas from JSON files on component mount
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                // Fetch districts
                // Ensure the path is correct: /data/districts.json if in public/data
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                // Correctly access the 'data' array from the provided districts.json structure
                setDistricts(districtsJson[2].data);

                // Fetch upazilas
                // Ensure the path is correct: /data/upazilas.json if in public/data
                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                // Correctly access the 'data' array from the provided upazilas.json structure
                setAllUpazilas(upazilasJson[2].data);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Failed to load location data.");
            }
        };
        loadLocationData();
    }, []);

    // Effect to filter upazilas when district changes
    useEffect(() => {
        if (formData.district) {
            // Find the district ID based on the selected district name
            const selectedDistrictId = districts.find(d => d.name === formData.district)?.id;
            if (selectedDistrictId) {
                // Filter all upazilas by the selected district ID
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        // Reset upazila selection when district changes
        setFormData(prev => ({ ...prev, upazila: '' }));
    }, [formData.district, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const saveUserDataToDatabase = async (userId, userData) => {
        try {
            console.log("Attempting to save user data to DB:", userData); // Log data being sent
            const response = await fetch(`${SERVER_ADDRESS}/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Log the full response for debugging
            const responseData = await response.json(); // Try to parse response even if not ok
            console.log("DB save response status:", response.status);
            console.log("DB save response data:", responseData);

            if (!response.ok) {
                // Throw an error with more details from the server response
                throw new Error(`Failed to save user data: ${responseData.message || response.statusText}`);
            }
            return responseData;
        } catch (error) {
            console.error("Error saving user data:", error);
            // Re-throw to be caught by handleRegister's catch block
            throw error;
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, photoURL, email, password, confirmPassword, bloodGroup, district, upazila } = formData;

        console.log("Form Data on Register:", formData); // Log form data for debugging
        console.log("Email:", email); // Log email for debugging
        console.log("Photo URL:", photoURL); // Log photo URL for debugging

        // Client-side validation
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            toast.error("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[a-z]/.test(password)) {
            toast.error("Password must contain at least one lowercase letter.");
            return;
        }
        // Add more complex password validation if needed (numbers, special chars)
        // if (!/\d/.test(password)) { toast.error("Password must contain at least one digit."); return; }
        // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { toast.error("Password must contain at least one special character."); return; }

        if (!acceptTerms) {
            setTermsError("You must accept the Terms & Conditions.");
            return;
        } else {
            setTermsError('');
        }

        try {
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // FIX: Ensure photoURL is null if empty string for updateUserProfile
            const UpdateedPhotoURL = photoURL.trim() === '' ? null : photoURL;

            await updateUserProfile(name, UpdateedPhotoURL);

            console.log("User profile updated:", { displayName: name, photoURL: UpdateedPhotoURL });

            // IMPORTANT: Include uid in the data object
            await saveUserDataToDatabase(user.uid, {
                uid: user.uid, // Explicitly adding uid to the data object
                name,
                email,
                photoURL: UpdateedPhotoURL,
                bloodGroup,
                district,
                upazila,
                status: 'active', // Default status
                createdAt: new Date().toISOString(),
                role: 'donor',
            });


            //  setUser({ ...user, displayName: name, photoURL: UpdateedPhotoURL }); // Update context user with cleaned photoURL
            toast.success("Registration successful! Welcome to LifeStream.");
            navigate("/");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already in use. Please try another email.");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format. Please check your email.");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password is too weak. Please use a stronger password.");
            } else {
                // Display the error message from saveUserDataToDatabase if it's the source of the error
                toast.error(`Registration failed: ${error.message}`);
                console.error("Registration Error:", error);
            }
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Join LifeStream</h1>
                    <p className="text-lg text-gray-600">Register to become a life-saver today!</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Photo URL */}
                    <div>
                        <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                        <input
                            type="url" // Changed to url type for better input validation
                            id="photoURL"
                            name="photoURL"
                            value={formData.photoURL}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/your-photo.jpg"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min. 6 characters, uppercase, lowercase"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter your password"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                        <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Select Your Blood Group</label>
                        <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    {/* District */}
                    <div>
                        <label htmlFor="district" className="block text-gray-700 text-sm font-semibold mb-2">Your District</label>
                        <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a district</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upazila */}
                    <div>
                        <label htmlFor="upazila" className="block text-gray-700 text-sm font-semibold mb-2">Your Upazila</label>
                        <select
                            id="upazila"
                            name="upazila"
                            value={formData.upazila}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!formData.district} // Disable if no district is selected
                        >
                            <option value="" disabled>Select an upazila</option>
                            {filteredUpazilas.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                        {!formData.district && (
                            <p className="text-sm text-gray-500 mt-1">Please select a district first to see upazilas.</p>
                        )}
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => {
                                setAcceptTerms(e.target.checked);
                                if (e.target.checked) setTermsError(''); // Clear error if checked
                            }}
                            className="checkbox checkbox-primary mr-2"
                        />
                        <label htmlFor="acceptTerms" className="text-gray-700 text-sm">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
                        </label>
                    </div>
                    {termsError && <p className="text-red-500 text-sm -mt-3">{termsError}</p>}


                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center"
                    >
                        Register <FaPaperPlane className="ml-2" />
                    </button>

                    {/* Login Link */}
                    <p className="py-3 font-semibold text-center text-gray-700">
                        Already Have an Account?{" "}
                        <Link className="text-blue-600 hover:underline" to="/auth/login">
                            Login Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;

import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane, FaEdit, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import axiosInstance from '../api/axiosInstance'; // axios instance
import axios from 'axios';

const UserProfile = () => {
    // The SERVER_ADDRESS is typically configured in axiosInstance's baseUrl
    // const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { user, updateUserProfile, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '',
        bloodGroup: '',
        district: '',
        upazila: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Debugging axiosInstance configuration
    useEffect(() => {
        console.log("Axios Instance Base URL:", axiosInstance.defaults.baseURL);
        // If axiosInstance doesn't have a baseURL, you might need to prepend SERVER_ADDRESS
        // or configure axiosInstance in '../api/axiosInstance.js' with the VITE_SERVER_URL
    }, []);


    useEffect(() => {
        const loadUserDataAndLocation = async () => {
            if (user && user.uid) {
                console.log("Loading user data for UID:", user.uid);
                try {
                    // Use axiosInstance for fetching user data
                    const userRes = await axiosInstance.get(`/user/${user.uid}`);

                    // Axios automatically checks for 2xx status codes and throws for others
                    const userDataFromDB = userRes.data; // Axios response data is in .data
                    setFormData({
                        name: userDataFromDB.name || user.displayName || '',
                        photoURL: userDataFromDB.photoURL || user.photoURL || '',
                        email: userDataFromDB.email || user.email || '',
                        bloodGroup: userDataFromDB.bloodGroup || '',
                        district: userDataFromDB.district || '',
                        upazila: userDataFromDB.upazila || '',
                    });

                    const districtsRes = await fetch('/districts.json');
                    const districtsJson = await districtsRes.json();
                    setDistricts(districtsJson[2].data);

                    const upazilasRes = await fetch('/upazilas.json');
                    const upazilasJson = await upazilasRes.json();
                    setAllUpazilas(upazilasJson[2].data);

                } catch (error) {
                    console.error("Failed to load user or location data:", error);
                    // Handle 404 specifically if user data is not found in DB
                    if (axios.isAxiosError(error) && error.response && error.response.status === 404) { // Use axios.isAxiosError
                        console.warn("User data not found in DB, initializing from Firebase Auth.");
                        setFormData({
                            name: user.displayName || '',
                            photoURL: user.photoURL || '',
                            email: user.email || '',
                            bloodGroup: '',
                            district: '',
                            upazila: '',
                        });
                    } else {
                        toast.error("Failed to load profile data.");
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                navigate('/auth/login');
            }
        };
        loadUserDataAndLocation();
    }, [user, navigate]); // Removed SERVER_ADDRESS from dependencies as it's handled by axiosInstance

    useEffect(() => {
        if (formData.district && allUpazilas.length > 0 && districts.length > 0) {
            const selectedDistrictId = districts.find(d => d.name === formData.district)?.id;
            if (selectedDistrictId) {
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
    }, [formData.district, districts, allUpazilas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const { name, photoURL, email, bloodGroup, district, upazila } = formData;
        const photoUrlToUpdate = photoURL.trim() === '' ? null : photoURL;

        try {
            await updateUserProfile({ displayName: name, photoURL: photoUrlToUpdate });

            const idToken = await getFirebaseIdToken();
            console.log("Frontend: idToken obtained:", idToken);
            if (!idToken) {
                console.error("Frontend: idToken is null or empty. Throwing error.");
                throw new Error("Failed to get authentication token.");
            }

            const response = await axiosInstance.put(
                `/updateuser/${user.uid}`, // URL
                { // Data payload
                    uid: user.uid,
                    name,
                    email,
                    photoURL: photoUrlToUpdate,
                    bloodGroup,
                    district,
                    upazila,
                },
                { // Configuration object (headers, etc.)
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`, // Send Firebase ID token
                    },
                }
            );

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Profile Update Error:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Error updating profile: ${error.response.data.message}`);
            } else {
                toast.error(`Error updating profile: ${error.message}`);
            }
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                email: user.email || '',
                bloodGroup: formData.bloodGroup,
                district: formData.district,
                upazila: formData.upazila,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading user profile...</p>
            </div>
        );
    }

    if (!user) {
        navigate('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Your Profile</h1>
                    <p className="text-lg text-gray-600">Manage your LifeStream account details.</p>
                </div>

                {!isEditing ? (
                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="avatar">
                                <div className="w-24 h-24 rounded-full ring ring-blue-500 ring-offset-base-100 ring-offset-2">
                                    <img src={formData.photoURL || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'} alt="User Avatar" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Name:</label>
                            <p className="text-lg font-medium">{formData.name || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Email:</label>
                            <p className="text-lg font-medium">{formData.email || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Blood Group:</label>
                            <p className="text-lg font-medium">{formData.bloodGroup || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">District:</label>
                            <p className="text-lg font-medium">{formData.district || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Upazila:</label>
                            <p className="text-lg font-medium">{formData.upazila || 'N/A'}</p>
                        </div>

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center mt-6"
                            onClick={handleEditClick}
                        >
                            Edit Profile <FaEdit className="ml-2" />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {/* Photo URL */}
                        <div>
                            <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                            <input
                                type="url"
                                id="photoURL"
                                name="photoURL"
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.photoURL}
                                onChange={handleChange}
                                placeholder="https://example.com/your-photo.jpg"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input input-bordered w-full px-4 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                                value={formData.email}
                                readOnly
                                disabled
                            />
                            <p className="text-sm text-gray-500 mt-1">Email cannot be changed.</p>
                        </div>

                        {/* Blood Group */}
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Select Your Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select a blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        {/* District */}
                        <div>
                            <label htmlFor="district" className="block text-gray-700 text-sm font-semibold mb-2">Your District</label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select a district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Upazila */}
                        <div>
                            <label htmlFor="upazila" className="block text-gray-700 text-sm font-semibold mb-2">Your Upazila</label>
                            <select
                                id="upazila"
                                name="upazila"
                                value={formData.upazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.district}
                            >
                                <option value="" disabled>Select an upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.district && (
                                <p className="text-sm text-gray-500 mt-1">Please select a district first to see upazilas.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                                onClick={handleCancelClick}
                            >
                                <FaTimesCircle className="mr-2" /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            >
                                Save Changes <FaPaperPlane className="ml-2" />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;


import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const EditDonationRequest = () => {
    const { user, userRole, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { donationRequest, error: loaderError } = useLoaderData();

    console.log("User Role:", userRole);

    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    // Effect to fetch location data
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                setDistricts(districtsJson[2].data);

                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                setAllUpazilas(upazilasJson[2].data);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Failed to load location data for form.");
            }
        };
        loadLocationData();
    }, []);

    // Effect to populate form data and filter upazilas on initial load
    useEffect(() => {
        if (loaderError) {
            toast.error(`Failed to load request for editing: ${loaderError.message}`);
            navigate('/dashboard');
        } else if (donationRequest) {
            setFormData({
                uid: donationRequest.uid || '',
                requesterName: donationRequest.requesterName || '',
                requesterEmail: donationRequest.requesterEmail || '',
                recipientName: donationRequest.recipientName || '',
                recipientDistrict: donationRequest.recipientDistrict || '',
                recipientUpazila: donationRequest.recipientUpazila || '',
                recipientStreet: donationRequest.recipientStreet || '',
                hospitalName: donationRequest.hospitalName || '',
                requestMessage: donationRequest.requestMessage || '',
                donationDate: donationRequest.donationDate || '',
                donationTime: donationRequest.donationTime || '',
                bloodGroup: donationRequest.bloodGroup || '',
                donationStatus: donationRequest.donationStatus || 'pending',
            });
            setIsLoadingForm(false);
        }
    }, [donationRequest, loaderError, navigate]);

    // A separate effect to filter upazilas based on the district and available data
    useEffect(() => {
        if (formData.recipientDistrict && allUpazilas.length > 0 && districts.length > 0) {
            const selectedDistrictId = districts.find(d => d.name === formData.recipientDistrict)?.id;
            if (selectedDistrictId) {
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        // This line is now removed as it was part of the original issue
        // We only clear the upazila if the district changes
        if (donationRequest && formData.recipientDistrict !== donationRequest.recipientDistrict) {
            setFormData(prev => ({ ...prev, recipientUpazila: '' }));
        }
    }, [formData.recipientDistrict, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const {
            recipientName, recipientDistrict, recipientUpazila, recipientStreet,
            hospitalName, donationDate, donationTime, bloodGroup
        } = formData;

        if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
            !hospitalName || !donationDate || !donationTime || !bloodGroup) {
            toast.error("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        const canEdit = userRole === 'admin' || user?.uid === formData.uid;
        if (!user || !canEdit) {
            toast.error("Unauthorized to edit this request.");
            setIsSubmitting(false);
            navigate('/auth/login');
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };

            const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                if (userRole === 'admin' || userRole === 'volunteer') {
                    navigate('/dashboard/all-blood-donation-requests');
                } else {
                    navigate('/dashboard/my-donation-requests');
                }
            } else {
                throw new Error(response.data.message || 'Failed to update donation request.');
            }

        } catch (error) {
            console.error("Error updating donation request:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Update failed: ${error.response.data.message}`);
            } else {
                toast.error(`Update failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle the cancel action with role-based navigation
    const handleCancel = () => {
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };

    if (isLoadingForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {(userRole === 'admin' || userRole === 'volunteer') && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                {/* Only admins can mark as completed */}
                                {userRole === 'admin' && <option value="completed">Completed</option>}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}
                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;


import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane } from 'react-icons/fa'; // Added FaPaperPlane import

const Register = () => {
    const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { createUser, setUser, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '',
        password: '',
        confirmPassword: '',
        bloodGroup: '',
        district: '',
        upazila: '',
    });

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for location data
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // State for terms and conditions
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [termsError, setTermsError] = useState('');

    // Load districts and upazilas from JSON files on component mount
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                // Fetch districts
                // Ensure the path is correct: /data/districts.json if in public/data
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                // Correctly access the 'data' array from the provided districts.json structure
                setDistricts(districtsJson[2].data);

                // Fetch upazilas
                // Ensure the path is correct: /data/upazilas.json if in public/data
                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                // Correctly access the 'data' array from the provided upazilas.json structure
                setAllUpazilas(upazilasJson[2].data);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Failed to load location data.");
            }
        };
        loadLocationData();
    }, []);

    // Effect to filter upazilas when district changes
    useEffect(() => {
        if (formData.district) {
            // Find the district ID based on the selected district name
            const selectedDistrictId = districts.find(d => d.name === formData.district)?.id;
            if (selectedDistrictId) {
                // Filter all upazilas by the selected district ID
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        // Reset upazila selection when district changes
        setFormData(prev => ({ ...prev, upazila: '' }));
    }, [formData.district, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const saveUserDataToDatabase = async (userId, userData) => {
        try {
            console.log("Attempting to save user data to DB:", userData); // Log data being sent
            const response = await fetch(`${SERVER_ADDRESS}/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Log the full response for debugging
            const responseData = await response.json(); // Try to parse response even if not ok
            console.log("DB save response status:", response.status);
            console.log("DB save response data:", responseData);

            if (!response.ok) {
                // Throw an error with more details from the server response
                throw new Error(`Failed to save user data: ${responseData.message || response.statusText}`);
            }
            return responseData;
        } catch (error) {
            console.error("Error saving user data:", error);
            // Re-throw to be caught by handleRegister's catch block
            throw error;
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, photoURL, email, password, confirmPassword, bloodGroup, district, upazila } = formData;

        console.log("Form Data on Register:", formData); // Log form data for debugging
        console.log("Email:", email); // Log email for debugging
        console.log("Photo URL:", photoURL); // Log photo URL for debugging

        // Client-side validation
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            toast.error("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[a-z]/.test(password)) {
            toast.error("Password must contain at least one lowercase letter.");
            return;
        }
        // Add more complex password validation if needed (numbers, special chars)
        // if (!/\d/.test(password)) { toast.error("Password must contain at least one digit."); return; }
        // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { toast.error("Password must contain at least one special character."); return; }

        if (!acceptTerms) {
            setTermsError("You must accept the Terms & Conditions.");
            return;
        } else {
            setTermsError('');
        }

        try {
            // Step 1: Create a new user in Firebase Authentication
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // Step 2: Clean up the photoURL and set it on the Firebase user profile
            const updatedPhotoURL = photoURL.trim() === '' ? null : photoURL;
            await updateUserProfile({ displayName: name, photoURL: updatedPhotoURL });
            console.log("User profile updated:", { displayName: name, photoURL: updatedPhotoURL });

            // Step 3: Save user data to your own backend database
            // IMPORTANT: Include uid in the data object for your backend
            await saveUserDataToDatabase(user.uid, {
                uid: user.uid, // Explicitly adding uid to the data object
                name,
                email,
                photoURL: updatedPhotoURL,
                bloodGroup,
                district,
                upazila,
                status: 'active', // Default status
                createdAt: new Date().toISOString(),
                role: 'donor',// Default role
            });


            // Update the user state in your context after all operations are complete
            setUser({ ...user, displayName: name, photoURL: updatedPhotoURL });
            toast.success("Registration successful! Welcome to LifeStream.");
            navigate("/");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already in use. Please try another email.");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format. Please check your email.");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password is too weak. Please use a stronger password.");
            } else {
                // Display the error message from saveUserDataToDatabase if it's the source of the error
                toast.error(`Registration failed: ${error.message}`);
                console.error("Registration Error:", error);
            }
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Join LifeStream</h1>
                    <p className="text-lg text-gray-600">Register to become a life-saver today!</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Photo URL */}
                    <div>
                        <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                        <input
                            type="url" // Changed to url type for better input validation
                            id="photoURL"
                            name="photoURL"
                            value={formData.photoURL}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/your-photo.jpg"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min. 6 characters, uppercase, lowercase"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter your password"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                        <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Select Your Blood Group</label>
                        <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    {/* District */}
                    <div>
                        <label htmlFor="district" className="block text-gray-700 text-sm font-semibold mb-2">Your District</label>
                        <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a district</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upazila */}
                    <div>
                        <label htmlFor="upazila" className="block text-gray-700 text-sm font-semibold mb-2">Your Upazila</label>
                        <select
                            id="upazila"
                            name="upazila"
                            value={formData.upazila}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!formData.district} // Disable if no district is selected
                        >
                            <option value="" disabled>Select an upazila</option>
                            {filteredUpazilas.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                        {!formData.district && (
                            <p className="text-sm text-gray-500 mt-1">Please select a district first to see upazilas.</p>
                        )}
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => {
                                setAcceptTerms(e.target.checked);
                                if (e.target.checked) setTermsError(''); // Clear error if checked
                            }}
                            className="checkbox checkbox-primary mr-2"
                        />
                        <label htmlFor="acceptTerms" className="text-gray-700 text-sm">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
                        </label>
                    </div>
                    {termsError && <p className="text-red-500 text-sm -mt-3">{termsError}</p>}


                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center"
                    >
                        Register <FaPaperPlane className="ml-2" />
                    </button>

                    {/* Login Link */}
                    <p className="py-3 font-semibold text-center text-gray-700">
                        Already Have an Account?{" "}
                        <Link className="text-blue-600 hover:underline" to="/auth/login">
                            Login Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const EditDonationRequest = () => {
    // Hooks and context for state management and navigation
    const { user, userRole, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    console.log("User Role: ", userRole);
    // useLoaderData provides the initial donation request from the router loader
    const { donationRequest, error: loaderError } = useLoaderData();

    // State for form data, location data, and UI status
    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    /**
     * This single useEffect hook is now responsible for handling all initial data loading.
     * It fetches location data (districts, upazilas) and then populates the form with
     * the donation request details from the loader. This prevents race conditions.
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch both JSON files concurrently using Promise.all for efficiency
                const [districtsRes, upazilasRes] = await Promise.all([
                    fetch('/districts.json'),
                    fetch('/upazilas.json')
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                // Set all location data in state
                const fetchedDistricts = districtsJson[2]?.data || [];
                const fetchedAllUpazilas = upazilasJson[2]?.data || [];
                setDistricts(fetchedDistricts);
                setAllUpazilas(fetchedAllUpazilas);

                // Handle loader errors and initial form population
                if (loaderError) {
                    toast.error(`Failed to load request for editing: ${loaderError.message}`);
                    navigate('/dashboard');
                    return; // Exit early if there's an error
                }

                if (donationRequest) {
                    // Populate the form with data from the loader
                    const initialFormData = {
                        uid: donationRequest.uid || '',
                        requesterName: donationRequest.requesterName || '',
                        requesterEmail: donationRequest.requesterEmail || '',
                        recipientName: donationRequest.recipientName || '',
                        recipientDistrict: donationRequest.recipientDistrict || '',
                        recipientUpazila: donationRequest.recipientUpazila || '',
                        recipientStreet: donationRequest.recipientStreet || '',
                        hospitalName: donationRequest.hospitalName || '',
                        requestMessage: donationRequest.requestMessage || '',
                        donationDate: donationRequest.donationDate || '',
                        donationTime: donationRequest.donationTime || '',
                        bloodGroup: donationRequest.bloodGroup || '',
                        donationStatus: donationRequest.donationStatus || 'pending',
                    };
                    setFormData(initialFormData);

                    // Filter upazilas based on the initial district
                    const selectedDistrictId = fetchedDistricts.find(d => d.name === initialFormData.recipientDistrict)?.id;
                    if (selectedDistrictId) {
                        const filtered = fetchedAllUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                        setFilteredUpazilas(filtered);
                    }
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Failed to load data for form. Please try again.");
            } finally {
                setIsLoadingForm(false); // Set loading to false regardless of success or failure
            }
        };

        loadInitialData();
    }, [donationRequest, loaderError, navigate]); // Dependencies ensure this runs when new data arrives

    /**
     * Unified handler for all input changes.
     * Special logic is included for the district dropdown to automatically
     * filter upazilas and reset the upazila value.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };

            // Special handling for district change
            if (name === 'recipientDistrict') {
                const selectedDistrictId = districts.find(d => d.name === value)?.id;
                if (selectedDistrictId) {
                    const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                    setFilteredUpazilas(filtered);
                } else {
                    setFilteredUpazilas([]);
                }
                // Reset the upazila when the district changes
                newFormData.recipientUpazila = '';
            }
            return newFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const {
            recipientName, recipientDistrict, recipientUpazila, recipientStreet,
            hospitalName, donationDate, donationTime, bloodGroup
        } = formData;

        if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
            !hospitalName || !donationDate || !donationTime || !bloodGroup) {
            toast.error("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        const canEdit = userRole === 'admin' || user?.uid === formData.uid;
        if (!user || !canEdit) {
            toast.error("Unauthorized to edit this request.");
            setIsSubmitting(false);
            // Optionally redirect after a brief delay for user feedback
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };

            const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                if (userRole === 'admin' || userRole === 'volunteer') {
                    navigate('/dashboard/all-donation-requests');
                } else {
                    navigate('/dashboard/my-donation-requests');
                }
            } else {
                throw new Error(response.data.message || 'Failed to update donation request.');
            }

        } catch (error) {
            console.error("Error updating donation request:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Update failed: ${error.response.data.message}`);
            } else {
                toast.error(`Update failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };

    // Render loading state if the form is still fetching data
    if (isLoadingForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // Render access denied message if the user is not authorized
    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    // Main form rendering
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {(userRole === 'admin' || userRole === 'volunteer') && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                {/* Only admins can mark as completed */}
                                {userRole === 'admin' && <option value="completed">Completed</option>}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}
                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaUserCheck, FaUserSlash, FaUserTie, FaUserShield, FaSpinner, FaFilePdf } from 'react-icons/fa'; // Icons for actions and PDF
import axios from 'axios'; // For axios.isAxiosError

// Load jsPDF and jspdf-autotable from CDN for client-side PDF generation
// The library will be available globally as 'jspdf' and its 'autoTable' plugin.
// This is a simple way to use it in a standalone React component without npm install.
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const UserManagement = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Fetch all users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) {
                setLoading(false);
                setError({ message: "User not authenticated." });
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // The axiosInstance interceptor should handle attaching the token
                const response = await axiosInstance.get('/allusers');
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching all users:", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                    setError({ message: err.response.data.message });
                    toast.error(`Failed to load users: ${err.response.data.message}`);
                } else {
                    setError({ message: "Failed to load users. Please try again." });
                    toast.error(`Failed to load users: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    // Function to generate and download PDF
    const handleDownloadPdf = async () => {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js');
        const { jsPDF } = window.jspdf;

        // Display a loading message with SweetAlert
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait, this may take a moment.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const title = "LifeStream User Report";
            const headers = [['Name', 'Email', 'Role', 'Status']];

            // Format the user data for the table
            const data = filteredUsers.map(user => [
                user.name || 'N/A',
                user.email || 'N/A',
                user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'N/A',
                user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'N/A'
            ]);

            // Add title and date to the document
            doc.setFontSize(20);
            doc.text(title, 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${date}`, 14, 26);

            // Add the table using the autotable plugin
            doc.autoTable({
                startY: 35,
                head: headers,
                body: data,
                styles: { fontSize: 10, cellPadding: 2 },
                headStyles: { fillColor: [71, 85, 105], textColor: 255 }, // bg-slate-700
                theme: 'striped',
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                }
            });

            // Save the PDF
            doc.save('lifestream-users.pdf');
            Swal.close();
            toast.success('PDF generated successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            Swal.close();
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    // Filtered users based on selected status
    const filteredUsers = users.filter(u => {
        if (filterStatus === 'all') {
            return true;
        }
        return u.status === filterStatus;
    });

    // Handle status toggle (Block/Unblock)
    const handleToggleStatus = async (userId, currentStatus) => {
        console.log("Toggling status for user ID:", userId);
        setUpdatingUserId(userId);

        try {
            const idToken = await getFirebaseIdToken();
            const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

            await axiosInstance.put(`/toggle-user-status/${userId}`, {
                newStatus: newStatus
            }, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            setUsers(prevUsers => prevUsers.map(u =>
                u._id === userId ? { ...u, status: newStatus } : u
            ));
            toast.success(`User status updated to '${newStatus}'.`);
        } catch (err) {
            console.error("Error toggling user status:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                toast.error(`Failed to toggle status: ${err.response.data.message}`);
            } else {
                toast.error(`Failed to toggle status: ${err.message}`);
            }
        } finally {
            setUpdatingUserId(null);
        }
    };

    // Updated handleChangeRole with SweetAlert confirmation
    const handleChangeRole = async (userId, newRole) => {
        console.log("Changing role for user ID:", userId, "to new role:", newRole);

        // SweetAlert warning only if the new role is 'admin'
        if (newRole === 'admin') {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You are about to change this user's role to Admin. Please note that Admin users have the highest level of access.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change role!',
                cancelButtonText: 'Cancel'
            });

            // If the user cancels, do not proceed with the role change.
            if (!result.isConfirmed) {
                // Reset the select input to its previous value to avoid visual discrepancy.
                return;
            }
        }

        setUpdatingUserId(userId);
        try {
            const idToken = await getFirebaseIdToken();
            const newStatus = 'active';

            await axiosInstance.put(`/set-user-role/${userId}`, {
                role: newRole,
                status: newStatus
            }, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            setUsers(prevUsers => prevUsers.map(u =>
                u._id === userId ? { ...u, role: newRole, status: newStatus } : u
            ));
            toast.success(`User role updated to '${newRole}'.`);
        } catch (err) {
            console.error("Error changing user role:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                toast.error(`Failed to change role: ${err.response.data.message}`);
            } else {
                toast.error(`Failed to change role: ${err.message}`);
            }
        } finally {
            setUpdatingUserId(null);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">Manage All Users</h1>
                    <p className="text-lg text-gray-600">Overview and control of user accounts on LifeStream.</p>
                </div>

                {/* Filter and Download Buttons */}
                <div className="mb-6 flex flex-col md:flex-row justify-end items-center space-y-4 md:space-y-0 md:space-x-4">
                    <button
                        onClick={handleDownloadPdf}
                        className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        <FaFilePdf className="mr-2" /> Download PDF
                    </button>
                    <div className="flex items-center">
                        <label htmlFor="statusFilter" className="block text-gray-700 text-sm font-semibold mr-3">Filter by Status:</label>
                        <select
                            id="statusFilter"
                            name="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="select select-bordered w-full max-w-xs px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>{error.message}</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>No users found matching the filter criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table id="users-table" className="table w-full border-collapse">
                            {/* Head */}
                            <thead className="bg-indigo-100 text-indigo-800 uppercase text-sm">
                                <tr>
                                    <th className="p-3 text-left rounded-tl-lg">Avatar</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Role</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img
                                                            src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || u.email}`}
                                                            alt={`${u.name || 'User'}'s avatar`}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 font-medium text-gray-800">{u.name || 'N/A'}</td>
                                        <td className="p-3 text-gray-700">{u.email || 'N/A'}</td>
                                        <td className="p-3 text-gray-700">{u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'N/A'}</td>
                                        <td className="p-3">
                                            <span className={`font-semibold ${u.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                                {u.status ? (u.status.charAt(0).toUpperCase() + u.status.slice(1)) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3 space-x-2">
                                            {/* Block/Unblock Button */}
                                            <button
                                                onClick={() => handleToggleStatus(u._id, u.status)}
                                                className={`btn btn-sm ${u.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors duration-200`}
                                                disabled={updatingUserId === u._id}
                                            >
                                                {updatingUserId === u._id ? <FaSpinner className="animate-spin" /> : (u.status === 'active' ? <FaUserSlash /> : <FaUserCheck />)}
                                                <span className="ml-1">{u.status === 'active' ? 'Block' : 'Unblock'}</span>
                                            </button>

                                            {/* Change Role Dropdown */}
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                                className="select select-bordered select-sm text-gray-700"
                                                disabled={updatingUserId === u._id}
                                            >
                                                <option value="donor">Donor</option>
                                                <option value="volunteer">Volunteer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;


import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import useRole from '../hooks/useRole'; // Import the custom hook

const EditDonationRequest = () => {
    // Hooks and context for state management and navigation
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    // Use the custom useRole hook to get the user's role and loading status
    const { role: userRole, loading: isRoleLoading } = useRole();

    // useLoaderData provides the initial donation request from the router loader
    const { donationRequest, error: loaderError } = useLoaderData();

    // State for form data, location data, and UI status
    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    /**
     * This single useEffect hook is now responsible for handling all initial data loading.
     * It fetches location data (districts, upazilas) and then populates the form with
     * the donation request details from the loader. This prevents race conditions.
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch both JSON files concurrently using Promise.all for efficiency
                const [districtsRes, upazilasRes] = await Promise.all([
                    fetch('/districts.json'),
                    fetch('/upazilas.json')
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                // Set all location data in state
                const fetchedDistricts = districtsJson[2]?.data || [];
                const fetchedAllUpazilas = upazilasJson[2]?.data || [];
                setDistricts(fetchedDistricts);
                setAllUpazilas(fetchedAllUpazilas);

                // Handle loader errors and initial form population
                if (loaderError) {
                    toast.error(`Failed to load request for editing: ${loaderError.message}`);
                    navigate('/dashboard');
                    return; // Exit early if there's an error
                }

                if (donationRequest) {
                    // Populate the form with data from the loader
                    const initialFormData = {
                        uid: donationRequest.uid || '',
                        requesterName: donationRequest.requesterName || '',
                        requesterEmail: donationRequest.requesterEmail || '',
                        recipientName: donationRequest.recipientName || '',
                        recipientDistrict: donationRequest.recipientDistrict || '',
                        recipientUpazila: donationRequest.recipientUpazila || '',
                        recipientStreet: donationRequest.recipientStreet || '',
                        hospitalName: donationRequest.hospitalName || '',
                        requestMessage: donationRequest.requestMessage || '',
                        donationDate: donationRequest.donationDate || '',
                        donationTime: donationRequest.donationTime || '',
                        bloodGroup: donationRequest.bloodGroup || '',
                        donationStatus: donationRequest.donationStatus || 'pending',
                    };
                    setFormData(initialFormData);

                    // Filter upazilas based on the initial district
                    const selectedDistrictId = fetchedDistricts.find(d => d.name === initialFormData.recipientDistrict)?.id;
                    if (selectedDistrictId) {
                        const filtered = fetchedAllUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                        setFilteredUpazilas(filtered);
                    }
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Failed to load data for form. Please try again.");
            } finally {
                setIsLoadingForm(false); // Set loading to false regardless of success or failure
            }
        };

        loadInitialData();
    }, [donationRequest, loaderError, navigate]); // Dependencies ensure this runs when new data arrives

    /**
     * Unified handler for all input changes.
     * Special logic is included for the district dropdown to automatically
     * filter upazilas and reset the upazila value.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };

            // Special handling for district change
            if (name === 'recipientDistrict') {
                const selectedDistrictId = districts.find(d => d.name === value)?.id;
                if (selectedDistrictId) {
                    const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                    setFilteredUpazilas(filtered);
                } else {
                    setFilteredUpazilas([]);
                }
                // Reset the upazila when the district changes
                newFormData.recipientUpazila = '';
            }
            return newFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const {
            recipientName, recipientDistrict, recipientUpazila, recipientStreet,
            hospitalName, donationDate, donationTime, bloodGroup
        } = formData;

        if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
            !hospitalName || !donationDate || !donationTime || !bloodGroup) {
            toast.error("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        // Check permissions using the role from the hook
        const canEdit = userRole === 'admin' || user?.uid === formData.uid;
        if (!user || !canEdit) {
            toast.error("Unauthorized to edit this request.");
            setIsSubmitting(false);
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };

            const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                // Use the role from the hook for redirection
                if (userRole === 'admin' || userRole === 'volunteer') {
                    navigate('/dashboard/all-blood-donation-requests');
                } else {
                    navigate('/dashboard/my-donation-requests');
                }
            } else {
                throw new Error(response.data.message || 'Failed to update donation request.');
            }

        } catch (error) {
            console.error("Error updating donation request:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Update failed: ${error.response.data.message}`);
            } else {
                toast.error(`Update failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Use the role from the hook for redirection
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };

    // Render loading state if the form or role is still fetching data
    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // Render access denied message if the user is not authorized
    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    // Main form rendering
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {(userRole === 'admin' || userRole === 'volunteer') && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                {/* Only admins can mark as completed */}
                                {userRole === 'admin' && <option value="completed">Completed</option>}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}
                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;


import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import useRole from '../hooks/useRole'; // Import the custom hook

const EditDonationRequest = () => {
    // Hooks and context for state management and navigation
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    // Use the custom useRole hook to get the user's role and loading status
    const { role: userRole, loading: isRoleLoading } = useRole();

    // useLoaderData provides the initial donation request from the router loader
    const { donationRequest, error: loaderError } = useLoaderData();

    // State for form data, location data, and UI status
    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    // const isVolunteerLimited = userRole === "volunteer";
    // const isAdminOrOwner = userRole === "admin" || user?.uid === formData.uid;

    const isOwner = user?.uid === formData.uid;
    const isAdmin = userRole === "admin";
    const isVolunteer = userRole === "volunteer";
    const isVolunteerLimited = isVolunteer && !isOwner; // Volunteers cannot edit others' requests


    /**
     * This single useEffect hook is now responsible for handling all initial data loading.
     * It fetches location data (districts, upazilas) and then populates the form with
     * the donation request details from the loader. This prevents race conditions.
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch both JSON files concurrently using Promise.all for efficiency
                const [districtsRes, upazilasRes] = await Promise.all([
                    fetch('/districts.json'),
                    fetch('/upazilas.json')
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                // Set all location data in state
                const fetchedDistricts = districtsJson[2]?.data || [];
                const fetchedAllUpazilas = upazilasJson[2]?.data || [];
                setDistricts(fetchedDistricts);
                setAllUpazilas(fetchedAllUpazilas);

                // Handle loader errors and initial form population
                if (loaderError) {
                    toast.error(`Failed to load request for editing: ${loaderError.message}`);
                    navigate('/dashboard');
                    return; // Exit early if there's an error
                }

                if (donationRequest) {
                    // Populate the form with data from the loader
                    const initialFormData = {
                        uid: donationRequest.uid || '',
                        requesterName: donationRequest.requesterName || '',
                        requesterEmail: donationRequest.requesterEmail || '',
                        recipientName: donationRequest.recipientName || '',
                        recipientDistrict: donationRequest.recipientDistrict || '',
                        recipientUpazila: donationRequest.recipientUpazila || '',
                        recipientStreet: donationRequest.recipientStreet || '',
                        hospitalName: donationRequest.hospitalName || '',
                        requestMessage: donationRequest.requestMessage || '',
                        donationDate: donationRequest.donationDate || '',
                        donationTime: donationRequest.donationTime || '',
                        bloodGroup: donationRequest.bloodGroup || '',
                        donationStatus: donationRequest.donationStatus || 'pending',
                    };
                    setFormData(initialFormData);

                    // Filter upazilas based on the initial district
                    const selectedDistrictId = fetchedDistricts.find(d => d.name === initialFormData.recipientDistrict)?.id;
                    if (selectedDistrictId) {
                        const filtered = fetchedAllUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                        setFilteredUpazilas(filtered);
                    }
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Failed to load data for form. Please try again.");
            } finally {
                setIsLoadingForm(false); // Set loading to false regardless of success or failure
            }
        };

        loadInitialData();
    }, [donationRequest, loaderError, navigate]); // Dependencies ensure this runs when new data arrives

    /**
     * Unified handler for all input changes.
     * Special logic is included for the district dropdown to automatically
     * filter upazilas and reset the upazila value.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };

            // Special handling for district change
            if (name === 'recipientDistrict') {
                const selectedDistrictId = districts.find(d => d.name === value)?.id;
                if (selectedDistrictId) {
                    const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                    setFilteredUpazilas(filtered);
                } else {
                    setFilteredUpazilas([]);
                }
                // Reset the upazila when the district changes
                newFormData.recipientUpazila = '';
            }
            return newFormData;
        });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     const {
    //         recipientName, recipientDistrict, recipientUpazila, recipientStreet,
    //         hospitalName, donationDate, donationTime, bloodGroup
    //     } = formData;

    //     // Basic validation for required fields
    //     if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
    //         !hospitalName || !donationDate || !donationTime || !bloodGroup) {
    //         toast.error("Please fill in all required fields.");
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     // Check permissions using the role from the hook
    //     const canEdit = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    //     if (!user || !canEdit) {
    //         toast.error("Unauthorized to edit this request.");
    //         setIsSubmitting(false);
    //         setTimeout(() => navigate('/auth/login'), 2000);
    //         return;
    //     }
    //     // Proceed with the update
    //     try {
    //         const idToken = await getFirebaseIdToken();
    //         if (!idToken) {
    //             throw new Error("Authentication token not available. Please log in again.");
    //         }

    //         const updatedRequestData = {
    //             ...formData,
    //             updatedAt: new Date().toISOString(),
    //         };

    //         const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${idToken}`,
    //             },
    //         });

    //         if (response.status === 200) {
    //             toast.success("Donation request updated successfully!");
    //             // Use the role from the hook for redirection
    //             if (userRole === 'admin' || userRole === 'volunteer') {
    //                 navigate('/dashboard/all-blood-donation-requests');
    //             } else {
    //                 navigate('/dashboard/my-donation-requests');
    //             }
    //         } else {
    //             throw new Error(response.data.message || 'Failed to update donation request.');
    //         }

    //     } catch (error) {
    //         console.error("Error updating donation request:", error);
    //         if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
    //             toast.error(`Update failed: ${error.response.data.message}`);
    //         } else {
    //             toast.error(`Update failed: ${error.message}`);
    //         }
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic validation for required fields
        let updatedRequestData = {};

        if (isOwner || isAdmin) {
            // Full access
            updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };
        } else if (isVolunteer) {
            // Volunteers only allowed to update donationStatus
            updatedRequestData = {
                donationStatus: formData.donationStatus,
                updatedAt: new Date().toISOString(),
            };
        } else {
            toast.error("You are not allowed to update this request.");
            setIsSubmitting(false);
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            const response = await axiosInstance.put(`/editDonationRequest/${id}`,
                updatedRequestData,
                {
                    headers: { Authorization: `Bearer ${idToken}` },
                }
            );

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                navigate(
                    isOwner || isAdmin
                        ? "/dashboard/my-donation-requests"
                        : "/dashboard/all-blood-donation-requests"
                );
            } else {
                throw new Error(response.data.message || "Failed to update donation request.");
            }
        } catch (error) {
            console.error("Error updating:", error);
            toast.error("Update failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCancel = () => {
        // Use the role from the hook for redirection
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-blood-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };

    // Render loading state if the form or role is still fetching data
    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // Render access denied message if the user is not authorized
    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    // Main form rendering
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {/* {(userRole === 'admin' || userRole === 'volunteer') && ( */}
                    {(isOwner || isAdmin || isVolunteer) && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                <option value="Cancle">Cancle</option>
                                {/* Only admins can mark as completed */}
                                {userRole === 'admin' && <option value="completed">Completed</option>}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}

                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                            disabled={isVolunteerLimited}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;





import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import useRole from '../hooks/useRole'; // Import the custom hook

const EditDonationRequest = () => {
    // Hooks and context for state management and navigation
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    // custom useRole hook to get the user's role and loading status
    const { role: userRole, loading: isRoleLoading } = useRole();

    // useLoaderData provides the initial donation request from the router loader
    const { donationRequest, error: loaderError } = useLoaderData();

    // State for form data, location data, and UI status
    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    // const isVolunteerLimited = userRole === "volunteer";
    // const isAdminOrOwner = userRole === "admin" || user?.uid === formData.uid;

    const isOwner = user?.uid === formData.uid;
    const isAdmin = userRole === "admin";
    const isVolunteer = userRole === "volunteer";
    const isVolunteerLimited = isVolunteer && !isOwner; // Volunteers cannot edit others' requests


    /**
     * This single useEffect hook is now responsible for handling all initial data loading.
     * It fetches location data (districts, upazilas) and then populates the form with
     * the donation request details from the loader. This prevents race conditions.
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch both JSON files concurrently using Promise.all for efficiency
                const [districtsRes, upazilasRes] = await Promise.all([
                    fetch('/districts.json'),
                    fetch('/upazilas.json')
                ]);

                //fetch all users
                const usersRes = await axiosInstance.get('/allusers');
                const users = usersRes.data || [];

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                // Set all location data in state
                const fetchedDistricts = districtsJson[2]?.data || [];
                const fetchedAllUpazilas = upazilasJson[2]?.data || [];
                setDistricts(fetchedDistricts);
                setAllUpazilas(fetchedAllUpazilas);

                // Handle loader errors and initial form population
                if (loaderError) {
                    toast.error(`Failed to load request for editing: ${loaderError.message}`);
                    navigate('/dashboard');
                    return; // Exit early if there's an error
                }

                if (donationRequest) {
                    // Populate the form with data from the loader
                    const initialFormData = {
                        uid: donationRequest.uid || '',
                        requesterName: donationRequest.requesterName || '',
                        requesterEmail: donationRequest.requesterEmail || '',
                        recipientName: donationRequest.recipientName || '',
                        recipientDistrict: donationRequest.recipientDistrict || '',
                        recipientUpazila: donationRequest.recipientUpazila || '',
                        recipientStreet: donationRequest.recipientStreet || '',
                        hospitalName: donationRequest.hospitalName || '',
                        requestMessage: donationRequest.requestMessage || '',
                        donationDate: donationRequest.donationDate || '',
                        donationTime: donationRequest.donationTime || '',
                        bloodGroup: donationRequest.bloodGroup || '',
                        donationStatus: donationRequest.donationStatus || 'pending',
                    };
                    setFormData(initialFormData);

                    // Filter upazilas based on the initial district
                    const selectedDistrictId = fetchedDistricts.find(d => d.name === initialFormData.recipientDistrict)?.id;
                    if (selectedDistrictId) {
                        const filtered = fetchedAllUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                        setFilteredUpazilas(filtered);
                    }
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Failed to load data for form. Please try again.");
            } finally {
                setIsLoadingForm(false); // Set loading to false regardless of success or failure
            }
        };

        loadInitialData();
    }, [donationRequest, loaderError, navigate]); // Dependencies ensure this runs when new data arrives

    /**
     * Unified handler for all input changes.
     * Special logic is included for the district dropdown to automatically
     * filter upazilas and reset the upazila value.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };

            // Special handling for district change
            if (name === 'recipientDistrict') {
                const selectedDistrictId = districts.find(d => d.name === value)?.id;
                if (selectedDistrictId) {
                    const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                    setFilteredUpazilas(filtered);
                } else {
                    setFilteredUpazilas([]);
                }
                // Reset the upazila when the district changes
                newFormData.recipientUpazila = '';
            }
            return newFormData;
        });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     const {
    //         recipientName, recipientDistrict, recipientUpazila, recipientStreet,
    //         hospitalName, donationDate, donationTime, bloodGroup
    //     } = formData;

    //     // Basic validation for required fields
    //     if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
    //         !hospitalName || !donationDate || !donationTime || !bloodGroup) {
    //         toast.error("Please fill in all required fields.");
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     // Check permissions using the role from the hook
    //     const canEdit = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    //     if (!user || !canEdit) {
    //         toast.error("Unauthorized to edit this request.");
    //         setIsSubmitting(false);
    //         setTimeout(() => navigate('/auth/login'), 2000);
    //         return;
    //     }
    //     // Proceed with the update
    //     try {
    //         const idToken = await getFirebaseIdToken();
    //         if (!idToken) {
    //             throw new Error("Authentication token not available. Please log in again.");
    //         }

    //         const updatedRequestData = {
    //             ...formData,
    //             updatedAt: new Date().toISOString(),
    //         };

    //         const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${idToken}`,
    //             },
    //         });

    //         if (response.status === 200) {
    //             toast.success("Donation request updated successfully!");
    //             // Use the role from the hook for redirection
    //             if (userRole === 'admin' || userRole === 'volunteer') {
    //                 navigate('/dashboard/all-blood-donation-requests');
    //             } else {
    //                 navigate('/dashboard/my-donation-requests');
    //             }
    //         } else {
    //             throw new Error(response.data.message || 'Failed to update donation request.');
    //         }

    //     } catch (error) {
    //         console.error("Error updating donation request:", error);
    //         if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
    //             toast.error(`Update failed: ${error.response.data.message}`);
    //         } else {
    //             toast.error(`Update failed: ${error.message}`);
    //         }
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic validation for required fields
        let updatedRequestData = {};

        if (isOwner || isAdmin) {
            // Full access
            updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };
        } else if (isVolunteer) {
            // Volunteers only allowed to update donationStatus
            updatedRequestData = {
                donationStatus: formData.donationStatus,
                updatedAt: new Date().toISOString(),
            };
        } else {
            toast.error("You are not allowed to update this request.");
            setIsSubmitting(false);
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            const response = await axiosInstance.put(`/editDonationRequest/${id}`,
                updatedRequestData,
                {
                    headers: { Authorization: `Bearer ${idToken}` },
                }
            );

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                navigate(
                    isOwner || isAdmin
                        ? "/dashboard/my-donation-requests"
                        : "/dashboard/all-blood-donation-requests"
                );
            } else {
                throw new Error(response.data.message || "Failed to update donation request.");
            }
        } catch (error) {
            console.error("Error updating:", error);
            toast.error("Update failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCancel = () => {
        // Use the role from the hook for redirection
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-blood-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };
    // Compute status options dynamically
    const getStatusOptions = () => {
        const currentStatus = formData.donationStatus;
        switch (currentStatus) {
            case 'pending':
                return ['pending', 'inProgress', 'cancel', 'completed'];
            case 'inProgress':
                return ['inProgress', 'cancel', 'completed'];
            default:
                return [currentStatus]; // For 'cancel' and 'completed', no further changes
        }
    };

    // Render loading state if the form or role is still fetching data
    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // Render access denied message if the user is not authorized
    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    // Main form rendering
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {/* {(userRole === 'admin' || userRole === 'volunteer') && ( */}
                    {/* <span>Current Request Status: <span className='text-amber-800 font-semibold'>{formData.donationStatus}</span></span> */}
                    {/* {(isOwner || isAdmin || isVolunteer) && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                <option value="cancle">Cancle</option>
                                <option value="=completed">Completed</option>
                                {/* Only admins can mark as completed */}
                    {/* {userRole === 'admin' && <option value="completed">Completed</option>} */}
                    {/* </select>
                        </div> */}
                    {/* )}  */}

                    {(isOwner || isAdmin || isVolunteer) && (
                        <div className="pt-4 border-t border-gray-200">
                            <span className=' text-gray-700 text-sm font-semibold mb-2'>Current Donation Status: <span className='text-amber-800 font-semibold'>{formData.donationStatus}</span></span>
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">
                                Update Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})
                            </label>

                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {getStatusOptions().map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}

                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isVolunteerLimited}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                            disabled={isVolunteerLimited}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;

import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../provider/AuthProvider";
import axiosInstance from "../api/axiosInstance";

const EditDonationRequest = ({ request, districts, upazilas, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);

    // ✅ Safe defaults so inputs never break
    const [formData, setFormData] = useState({
        recipientName: "",
        hospitalName: "",
        recipientDistrict: "",
        recipientUpazila: "",
        recipientStreet: "",
        requestMessage: "",
        donationDate: "",
        donationTime: "",
        donationStatus: "pending",
    });

    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // ✅ Load request data into formData when available
    useEffect(() => {
        if (request) {
            setFormData({
                recipientName: request.recipientName || "",
                hospitalName: request.hospitalName || "",
                recipientDistrict: request.recipientDistrict || "",
                recipientUpazila: request.recipientUpazila || "",
                recipientStreet: request.recipientStreet || "",
                requestMessage: request.requestMessage || "",
                donationDate: request.donationDate || "",
                donationTime: request.donationTime || "",
                donationStatus: request.donationStatus || "pending",
            });
        }
    }, [request]);

    // ✅ Filter upazilas by district
    useEffect(() => {
        if (formData.recipientDistrict) {
            setFilteredUpazilas(
                upazilas.filter((u) => u.district_id === formData.recipientDistrict)
            );
        } else {
            setFilteredUpazilas([]);
        }
    }, [formData.recipientDistrict, upazilas]);

    // ✅ Role checks
    const isAdmin = user?.role === "admin";
    const isVolunteer = user?.role === "volunteer";
    const isOwner = user?.email === request?.requesterEmail;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Volunteers and owners can only change status
        if (isVolunteer || isOwner) {
            const updatedData = { donationStatus: formData.donationStatus };
            try {
                const res = await axiosInstance.put(`/donation-requests/${request._id}`, updatedData);
                toast.success("Donation status updated successfully");
                onUpdate(res.data);
                onClose();
            } catch (error) {
                toast.error("Failed to update donation request");
            }
            return;
        }

        // Admin can update everything
        try {
            const res = await axiosInstance.put(`/donation-requests/${request._id}`, formData);
            toast.success("Donation request updated successfully");
            onUpdate(res.data);
            onClose();
        } catch (error) {
            toast.error("Failed to update donation request");
        }
    };

    // ✅ Show loading if request not ready
    if (!request) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <p className="text-gray-700">Loading request...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Edit Donation Request</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipient Name */}
                    <div>
                        <label className="block text-gray-700">Recipient Name</label>
                        <input
                            type="text"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* Hospital Name */}
                    <div>
                        <label className="block text-gray-700">Hospital Name</label>
                        <input
                            type="text"
                            name="hospitalName"
                            value={formData.hospitalName}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-gray-700">Recipient District</label>
                        <select
                            name="recipientDistrict"
                            value={formData.recipientDistrict}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        >
                            <option value="">Select District</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Upazila */}
                    <div>
                        <label className="block text-gray-700">Recipient Upazila</label>
                        <select
                            name="recipientUpazila"
                            value={formData.recipientUpazila}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        >
                            <option value="">Select Upazila</option>
                            {filteredUpazilas.map((u) => (
                                <option key={u.id} value={u.name}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Street */}
                    <div>
                        <label className="block text-gray-700">Street</label>
                        <input
                            type="text"
                            name="recipientStreet"
                            value={formData.recipientStreet}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* Request Message */}
                    <div>
                        <label className="block text-gray-700">Request Message</label>
                        <textarea
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* Donation Date */}
                    <div>
                        <label className="block text-gray-700">Donation Date</label>
                        <input
                            type="date"
                            name="donationDate"
                            value={formData.donationDate}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* Donation Time */}
                    <div>
                        <label className="block text-gray-700">Donation Time</label>
                        <input
                            type="time"
                            name="donationTime"
                            value={formData.donationTime}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            disabled={isVolunteer || (!isAdmin && !isOwner)}
                        />
                    </div>

                    {/* Donation Status */}
                    <div>
                        <label className="block text-gray-700">Donation Status</label>
                        <select
                            name="donationStatus"
                            value={formData.donationStatus}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                            disabled={!isAdmin && !isVolunteer && !isOwner}
                        >
                            <option value="pending">Pending</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Update Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;

import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../provider/AuthProvider";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useParams, useLoaderData } from "react-router";
import { FaPaperPlane, FaTimesCircle } from "react-icons/fa";
import useRole from "../hooks/useRole";

const EditDonationRequest = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { role: userRole, loading: isRoleLoading } = useRole();
    const { donationRequest, error: loaderError } = useLoaderData();

    const [formData, setFormData] = useState({});
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    const [previousStatus, setPreviousStatus] = useState("");
    const [showDonorModal, setShowDonorModal] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState("");

    // Determine permissions
    const isOwner = user?.uid === donationRequest.uid;
    const isAdmin = userRole === "admin";
    const isVolunteer = userRole === "volunteer";


    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [districtsRes, upazilasRes, usersRes] = await Promise.all([
                    fetch("/districts.json"),
                    fetch("/upazilas.json"),
                    axiosInstance.get("/allusers"),
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                setDistricts(districtsJson[2]?.data || []);
                setAllUpazilas(upazilasJson[2]?.data || []);
                setAllUsers(usersRes.data || []);

                if (loaderError) {
                    toast.error(`Failed to load request: ${loaderError.message}`);
                    navigate("/dashboard");
                    return;
                }

                if (donationRequest) {
                    setFormData({
                        ...donationRequest,
                        donationStatus: donationRequest.donationStatus || "pending",
                    });
                    setPreviousStatus(donationRequest.donationStatus || "pending");

                    const selectedDistrictId = (districtsJson[2]?.data || []).find(
                        (d) => d.name === donationRequest.recipientDistrict
                    )?.id;

                    if (selectedDistrictId) {
                        setFilteredUpazilas(
                            (upazilasJson[2]?.data || []).filter(
                                (u) => u.district_id === selectedDistrictId
                            )
                        );
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load form data");
            } finally {
                setIsLoadingForm(false);
            }
        };
        loadInitialData();
    }, [donationRequest, loaderError, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (
            name === "donationStatus" &&
            (isAdmin || isVolunteer || isOwner) &&
            previousStatus === "pending" &&
            value === "inProgress"
        ) {
            setShowDonorModal(true);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "recipientDistrict") {
            const selectedDistrictId = districts.find((d) => d.name === value)?.id;
            setFilteredUpazilas(
                selectedDistrictId
                    ? allUpazilas.filter((u) => u.district_id === selectedDistrictId)
                    : []
            );
            setFormData((prev) => ({ ...prev, recipientUpazila: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (
            (isAdmin || isVolunteer || isOwner) &&
            formData.donationStatus === "inProgress" &&
            !selectedDonor
        ) {
            toast.error("Please select a donor before proceeding.");
            setIsSubmitting(false);
            return;
        }

        let updatedRequestData = {};
        if (isOwner || isAdmin) {
            updatedRequestData = {
                ...formData,
                donorId: selectedDonor || formData.donorId,
                updatedAt: new Date().toISOString(),
            };
        } else if (isVolunteer) {
            updatedRequestData = {
                donationStatus: formData.donationStatus,
                donorId: selectedDonor || formData.donorId,
                updatedAt: new Date().toISOString(),
            };
        } else {
            toast.error("You are not allowed to update this request.");
            setIsSubmitting(false);
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            toast.success("Donation request updated successfully!");
            navigate(isOwner ? "/dashboard/my-donation-requests" : "/dashboard/all-blood-donation-requests");
        } catch (error) {
            console.error(error);
            toast.error("Update failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(isAdmin || isVolunteer ? "/dashboard/all-blood-donation-requests" : "/dashboard/my-donation-requests");
    };

    const getStatusOptions = () => {
        switch (formData.donationStatus) {
            case "pending":
                return ["pending", "inProgress", "cancel", "completed"];
            case "inProgress":
                return ["inProgress", "cancel", "completed"];
            default:
                return [formData.donationStatus];
        }
    };

    const DonorModal = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Select Donor</h2>
                <select
                    value={selectedDonor}
                    onChange={(e) => setSelectedDonor(e.target.value)}
                    className="select select-bordered w-full mb-4"
                >
                    <option value="">-- Choose a Donor --</option>
                    {allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                        </option>
                    ))}
                </select>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setSelectedDonor("");
                            setShowDonorModal(false);
                            setFormData((prev) => ({ ...prev, donationStatus: "pending" }));
                        }}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedDonor) {
                                toast.error("Please select a donor.");
                                return;
                            }
                            setShowDonorModal(false);
                        }}
                        className="btn bg-blue-600 text-white"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    if (!(isAdmin || isVolunteer || isOwner)) {
        return <p className="text-center text-red-500">Access Denied</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">Edit Donation Request</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status */}
                    <div className="pt-4 border-t border-gray-200">
                        <span className="block text-gray-700 text-sm font-semibold mb-2">
                            Current Donation Status: <span className="text-amber-800 font-semibold">{formData.donationStatus}</span>
                        </span>
                        <select
                            id="donationStatus"
                            name="donationStatus"
                            value={formData.donationStatus}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg"
                        >
                            {getStatusOptions().map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Recipient Details */}
                    {[
                        "recipientName",
                        "recipientDistrict",
                        "recipientUpazila",
                        "recipientStreet",
                        "hospitalName",
                        "donationDate",
                        "donationTime",
                        "bloodGroup",
                        "requestMessage",
                    ].map((field) => (
                        <div key={field}>
                            <label className="block text-gray-700">{field.replace(/([A-Z])/g, " $1")}</label>
                            {field === "recipientDistrict" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select district</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            ) : field === "recipientUpazila" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer || !formData.recipientDistrict}
                                >
                                    <option value="">Select upazila</option>
                                    {filteredUpazilas.map((u) => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            ) : field === "requestMessage" ? (
                                <textarea
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            ) : field === "bloodGroup" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select blood group</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.includes("Date") ? "date" : field.includes("Time") ? "time" : "text"}
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {showDonorModal && <DonorModal />}
        </div>
    );
};

export default EditDonationRequest;

import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../provider/AuthProvider";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useParams, useLoaderData } from "react-router";
import { FaPaperPlane, FaTimesCircle } from "react-icons/fa";
import useRole from "../hooks/useRole";

const EditDonationRequest = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { role: userRole, loading: isRoleLoading } = useRole();
    const { donationRequest, error: loaderError } = useLoaderData();

    const [formData, setFormData] = useState({});
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    const [previousStatus, setPreviousStatus] = useState("");
    const [showDonorModal, setShowDonorModal] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState("");

    // Determine permissions
    const isOwner = user?.uid === donationRequest.uid;
    const isAdmin = userRole === "admin";
    const isVolunteer = userRole === "volunteer";


    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [districtsRes, upazilasRes, usersRes] = await Promise.all([
                    fetch("/districts.json"),
                    fetch("/upazilas.json"),
                    axiosInstance.get("/allusers"),
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();

                setDistricts(districtsJson[2]?.data || []);
                setAllUpazilas(upazilasJson[2]?.data || []);
                setAllUsers(usersRes.data || []);

                if (loaderError) {
                    toast.error(`Failed to load request: ${loaderError.message}`);
                    navigate("/dashboard");
                    return;
                }

                if (donationRequest) {
                    setFormData({
                        ...donationRequest,
                        donationStatus: donationRequest.donationStatus || "pending",
                    });
                    setPreviousStatus(donationRequest.donationStatus || "pending");

                    const selectedDistrictId = (districtsJson[2]?.data || []).find(
                        (d) => d.name === donationRequest.recipientDistrict
                    )?.id;

                    if (selectedDistrictId) {
                        setFilteredUpazilas(
                            (upazilasJson[2]?.data || []).filter(
                                (u) => u.district_id === selectedDistrictId
                            )
                        );
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load form data");
            } finally {
                setIsLoadingForm(false);
            }
        };
        loadInitialData();
    }, [donationRequest, loaderError, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (
            name === "donationStatus" &&
            (isAdmin || isVolunteer || isOwner) &&
            previousStatus === "pending" &&
            value === "inProgress"
        ) {
            setShowDonorModal(true);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "recipientDistrict") {
            const selectedDistrictId = districts.find((d) => d.name === value)?.id;
            setFilteredUpazilas(
                selectedDistrictId
                    ? allUpazilas.filter((u) => u.district_id === selectedDistrictId)
                    : []
            );
            setFormData((prev) => ({ ...prev, recipientUpazila: "" }));
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     if (
    //         (isAdmin || isVolunteer || isOwner) &&
    //         formData.donationStatus === "inProgress" &&
    //         !selectedDonor
    //     ) {
    //         toast.error("Please select a donor before proceeding.");
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     let updatedRequestData = {};
    //     if (isOwner || isAdmin) {
    //         updatedRequestData = {
    //             ...formData,
    //             donorId: selectedDonor || formData.donorId,
    //             updatedAt: new Date().toISOString(),
    //         };
    //     } else if (isVolunteer) {
    //         updatedRequestData = {
    //             donationStatus: formData.donationStatus,
    //             donorId: selectedDonor || formData.donorId,
    //             updatedAt: new Date().toISOString(),
    //         };
    //     } else {
    //         toast.error("You are not allowed to update this request.");
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     try {
    //         const idToken = await getFirebaseIdToken();
    //         await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
    //             headers: { Authorization: `Bearer ${idToken}` },
    //         });

    //         toast.success("Donation request updated successfully!");
    //         navigate(isOwner ? "/dashboard/my-donation-requests" : "/dashboard/all-blood-donation-requests");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Update failed.");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (
            (isAdmin || isVolunteer || isOwner) &&
            formData.donationStatus === "inProgress" &&
            !selectedDonor
        ) {
            toast.error("Please select a donor before proceeding.");
            setIsSubmitting(false);
            return;
        }

        // find donor info
        let donorInfo = {};
        if (selectedDonor) {
            const donorUser = allUsers.find((u) => u._id === selectedDonor);

            if (donorUser) {
                donorInfo = {
                    donorName: donorUser.name,
                    donorEmail: donorUser.email,
                };
            }
            // console.log("Selected Donor User:", donorUser.name, donorUser.email);
        }

        let updatedRequestData = {};
        if (isOwner || isAdmin) {
            updatedRequestData = {
                ...formData,
                ...donorInfo,
                updatedAt: new Date().toISOString(),
            };
        } else if (isVolunteer) {
            updatedRequestData = {
                donationStatus: formData.donationStatus,
                ...donorInfo,
                updatedAt: new Date().toISOString(),
            };
        } else {
            toast.error("You are not allowed to update this request.");
            setIsSubmitting(false);
            return;
        }
        console.log("Updated Request Data:", updatedRequestData);

        try {
            const idToken = await getFirebaseIdToken();
            await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            toast.success("Donation request updated successfully!");
            navigate(isOwner ? "/dashboard/my-donation-requests" : "/dashboard/all-blood-donation-requests");
        } catch (error) {
            console.error(error);
            toast.error("Update failed.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCancel = () => {
        navigate(isAdmin || isVolunteer ? "/dashboard/all-blood-donation-requests" : "/dashboard/my-donation-requests");
    };

    const getStatusOptions = () => {
        switch (formData.donationStatus) {
            case "pending":
                return ["pending", "inProgress", "cancel", "completed"];
            case "inProgress":
                return ["inProgress", "cancel", "completed"];
            default:
                return [formData.donationStatus];
        }
    };

    const DonorModal = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Select Donor</h2>
                <select
                    value={selectedDonor}
                    onChange={(e) => setSelectedDonor(e.target.value)}
                    className="select select-bordered w-full mb-4"
                >
                    <option value="">-- Choose a Donor --</option>
                    {allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                        </option>
                    ))}
                </select>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setSelectedDonor("");
                            setShowDonorModal(false);
                            setFormData((prev) => ({ ...prev, donationStatus: "pending" }));
                        }}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedDonor) {
                                toast.error("Please select a donor.");
                                return;
                            }
                            setShowDonorModal(false);
                        }}
                        className="btn bg-blue-600 text-white"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    if (!(isAdmin || isVolunteer || isOwner)) {
        return <p className="text-center text-red-500">Access Denied</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">Edit Donation Request</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status */}
                    <div className="pt-4 border-t border-gray-200">
                        <span className="block text-gray-700 text-sm font-semibold mb-2">
                            Current Donation Status: <span className="text-amber-800 font-semibold">{formData.donationStatus}</span>
                        </span>
                        <select
                            id="donationStatus"
                            name="donationStatus"
                            value={formData.donationStatus}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg"
                        >
                            {getStatusOptions().map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Recipient Details */}
                    {[
                        "recipientName",
                        "recipientDistrict",
                        "recipientUpazila",
                        "recipientStreet",
                        "hospitalName",
                        "donationDate",
                        "donationTime",
                        "bloodGroup",
                        "requestMessage",
                    ].map((field) => (
                        <div key={field}>
                            <label className="block text-gray-700">{field.replace(/([A-Z])/g, " $1")}</label>
                            {field === "recipientDistrict" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select district</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            ) : field === "recipientUpazila" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer || !formData.recipientDistrict}
                                >
                                    <option value="">Select upazila</option>
                                    {filteredUpazilas.map((u) => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            ) : field === "requestMessage" ? (
                                <textarea
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            ) : field === "bloodGroup" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select blood group</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.includes("Date") ? "date" : field.includes("Time") ? "time" : "text"}
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {showDonorModal && <DonorModal />}
        </div>
    );
};

export default EditDonationRequest;

