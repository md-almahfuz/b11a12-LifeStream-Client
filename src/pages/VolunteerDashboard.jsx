import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaUsers, FaCheckCircle, FaHourglassHalf, FaMoneyBillWave } from 'react-icons/fa'; // Icons for cards
import axios from 'axios'; // For axios.isAxiosError

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext); // Get the user object from AuthContext
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompletedDonations: 0,
        totalPendingRequests: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorFetchingStats, setErrorFetchingStats] = useState(false);

    useEffect(() => {
        const fetchVolunteerStats = async () => {
            if (!user) {
                setLoadingStats(false);
                return; // No user, no stats to fetch
            }

            setLoadingStats(true);
            setErrorFetchingStats(false);

            try {
                // Fetch total users
                const usersResponse = await axiosInstance.get('/allusers-count');
                //console.log("Total users response:", usersResponse);
                const totalUsers = usersResponse.data.count || 0;
                // const totalUsers = usersResponse.data.count;
                //console.log("Total users:", totalUsers);
                //const totalUsers = usersResponse || 0;

                // Fetch total donations collected (amount)
                // IMPORTANT: This assumes your backend aggregates a 'donatedAmount' field
                // from completed donation requests or a separate 'donations' collection.
                //const donationsResponse = await axiosInstance.get('/admin/stats/donations');
                //const totalDonationsAmount = donationsResponse.data.totalAmount || 0;
                const donationsResponse = 300000; // Mocked value for total donations
                const totalDonationsAmount = donationsResponse || 0;

                // Fetch total blood donation requests
                const requestsResponse = await axiosInstance.get('/all-donation-requests-count');
                const totalRequests = requestsResponse.data.count || 0;

                setStats({
                    totalUsers,
                    totalDonationsAmount,
                    totalRequests,
                });

            } catch (error) {
                console.error("Error fetching volunteer stats:", error);
                if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                    toast.error(`Failed to load volunteer stats: ${error.response.data.message}`);
                } else {
                    toast.error(`Failed to load volunteer stats: ${error.message}`);
                }
                setErrorFetchingStats(true);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchVolunteerStats();
    }, [user]); // Re-fetch if user object changes (e.g., login/logout)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                {/* Welcome Message */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-purple-800 mb-2">
                        Welcome, {user?.displayName || 'Volunteer'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your dedication makes a difference. Here's an overview of current needs.
                    </p>
                </div>

                {loadingStats ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-purple-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading dashboard statistics...</p>
                    </div>
                ) : errorFetchingStats ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>Could not load dashboard statistics. Please try again later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {/* Card 1: Total Users */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaUsers className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
                            <p className="text-xl font-semibold mt-1">Total Users</p>
                        </div>

                        {/* Card 2: Total Completed Donations */}
                        {/* <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaCheckCircle className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">{stats.totalDonationsAmount}</h3>
                            <p className="text-xl font-semibold mt-1">Toatl Donation Money</p>
                        </div> */}

                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaMoneyBillWave className="text-5xl mb-3" /> {/* Using money icon */}
                            <h3 className="text-4xl font-bold">৳{stats.totalDonationsAmount.toLocaleString()}</h3> {/* Formatted with Taka symbol */}
                            <p className="text-xl font-semibold mt-1">Total Donations in Taka</p> {/* Updated text */}
                        </div>

                        {/* Card 3: Total Pending Donation Requests */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                            <FaHourglassHalf className="text-5xl mb-3" />
                            <h3 className="text-4xl font-bold">{stats.totalRequests}</h3>
                            <p className="text-xl font-semibold mt-1">Total Blood Donation Requests</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;
