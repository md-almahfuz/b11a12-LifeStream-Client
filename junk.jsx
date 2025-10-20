import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { FaUsers, FaMoneyBillWave, FaTint } from 'react-icons/fa';
import axios from 'axios';
import useRole from '../hooks/useRole'; // Import the useRole hook
import Loading from '../pages/Loading'; // A simple loading spinner component

const AdminDashboard = () => {
    // Use the useRole hook to get the user's role and its loading state
    const { role, isLoading } = useRole();
    const { user } = useContext(AuthContext); // Keep user from context for profile data

    // console.log("AdminDashboard Render - Role:", role, "IsLoading:", isLoading, "User:", user);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonationsAmount: 0,
        totalRequests: 0,
    });
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorFetchingStats, setErrorFetchingStats] = useState(false);

    useEffect(() => {
        const fetchAdminStats = async () => {

            // Wait for the role to be fully loaded and confirmed as 'admin'
            if (isLoading || role !== 'admin' || !user) return;

            setLoadingStats(true);
            setErrorFetchingStats(false);

            try {
                // Get the ID token for the API calls.
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
    }, [isLoading, role, user]); // Depend on isLoading, role, and user from the hook/context

    // 1. Show spinner while the role is being fetched
    if (isLoading) {
        return <Loading />;
    }

    // 2. If the user object is not available (not logged in)
    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold">Please log in</h1>
            </div>
        );
    }

    // 3. If logged in but the role is not 'admin'
    if (role !== 'admin') {
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

    // Admin view
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

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { FaUsers, FaMoneyBillWave, FaTint } from 'react-icons/fa';
import axios from 'axios';
import useRole from '../hooks/useRole';
import Loading from '../pages/Loading';

// Import Recharts
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, PieChart, Pie,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const { role, isLoading } = useRole();
    const { user } = useContext(AuthContext);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonationsAmount: 0,
        totalRequests: 0,
    });

    const [donationTrends, setDonationTrends] = useState({
        daily: [],
        weekly: [],
        monthly: [],
    });



    const [loadingStats, setLoadingStats] = useState(false);
    const [errorFetchingStats, setErrorFetchingStats] = useState(false);

    useEffect(() => {
        const fetchAdminStats = async () => {
            if (isLoading || role !== 'admin' || !user) return;
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

                // Fetch trends data
                const trendsResponse = await axiosInstance.get('/donations-trends', {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });

                setDonationTrends(trendsResponse.data);
                setStats({ totalUsers, totalDonationsAmount, totalRequests });

            } catch (error) {
                console.error("Error fetching admin stats:", error);
                toast.error(`Failed to load admin stats: ${error.message}`);
                setErrorFetchingStats(true);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchAdminStats();
    }, [isLoading, role, user]);

    console.log(donationTrends);

    if (isLoading) return <Loading />;
    if (!user) return <div className="flex justify-center items-center min-h-screen"><h1>Please log in</h1></div>;
    if (role !== 'admin') return <div className="text-center text-2xl text-red-600 mt-20">403 - Access Denied</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">
                        Welcome, {user?.displayName || 'Admin'}!
                    </h1>
                    <p className="text-lg text-gray-600">Here's an overview of your LifeStream platform.</p>
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
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                                <FaUsers className="text-5xl mb-3" />
                                <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
                                <p className="text-xl font-semibold mt-1">Total Users</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                                <FaMoneyBillWave className="text-5xl mb-3" />
                                <h3 className="text-4xl font-bold">৳{stats.totalDonationsAmount.toLocaleString()}</h3>
                                <p className="text-xl font-semibold mt-1">Donations Collected</p>
                            </div>
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                                <FaTint className="text-5xl mb-3" />
                                <h3 className="text-4xl font-bold">{stats.totalRequests}</h3>
                                <p className="text-xl font-semibold mt-1">Donation Requests</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-indigo-800 mb-4 text-center">Donation Trends</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Daily Donations */}
                                <div className="bg-white border rounded-xl p-4 shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Daily Donations</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={donationTrends.daily}>
                                            <defs>
                                                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="count" stroke="#4f46e5" fillOpacity={1} fill="url(#colorDaily)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Weekly Donations */}
                                <div className="bg-white border rounded-xl p-4 shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Weekly Donations</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={donationTrends.weekly}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Monthly Donations */}
                                {/* <div className="bg-white border rounded-xl p-4 shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Monthly Donations</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={donationTrends.monthly}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <BarChart dataKey="count" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div> */}
                                {/* Monthly Donations */}
                                <div className="bg-white border rounded-xl p-4 shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Monthly Donations</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={donationTrends.monthly}
                                                dataKey="count"
                                                nameKey="month"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#ef4444"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {donationTrends.monthly.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#22d3ee", "#84cc16", "#e11d48", "#0ea5e9"][index % 12]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [`${value} donations`, name]}
                                                contentStyle={{
                                                    backgroundColor: "white",
                                                    borderRadius: "8px",
                                                    border: "1px solid #e5e7eb",
                                                }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

