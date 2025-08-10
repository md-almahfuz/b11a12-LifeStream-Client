import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa'; // Icons for better visuals
import { useNavigate } from 'react-router';

const DonorDashboardHome = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate(); // Initialize navigate hook
    const [recentRequests, setRecentRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [errorFetchingRequests, setErrorFetchingRequests] = useState(false);

    useEffect(() => {
        const fetchRecentDonationRequests = async () => {
            if (!user || !user.uid) {
                setLoadingRequests(false);
                return; // No user, no requests to fetch
            }

            setLoadingRequests(true);
            setErrorFetchingRequests(false); // Reset error state

            try {
                const idToken = await getFirebaseIdToken();
                if (!idToken) {
                    throw new Error("Authentication token not available. Please log in again.");
                }

                // Assuming your backend has an endpoint like /donationRequests/recent
                // that returns the 3 most recent requests for the logged-in user.
                // You will need to implement this endpoint on your backend.
                const response = await axiosInstance.get(`/donationRequests/recent/${user.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                setRecentRequests(response.data);
            } catch (error) {
                console.error("Error fetching recent donation requests:", error);
                toast.error("Failed to load recent donation requests.");
                setErrorFetchingRequests(true);
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchRecentDonationRequests();
    }, [user, getFirebaseIdToken]); // Re-fetch if user or token function changes

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'N/A';
        try {
            const dateTimeString = `${date}T${time}:00`; // Combine date and time
            const options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            };
            return new Date(dateTimeString).toLocaleString(undefined, options);
        } catch (e) {
            console.error("Error formatting date/time:", e);
            return `${date} at ${time}`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                {/* Welcome Message */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
                        Welcome, {user?.displayName || 'LifeStream Donor'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for being a vital part of our community. Your generosity saves lives!
                    </p>
                </div>

                {/* Recent Donation Requests Section */}
                <h2 className="text-3xl font-bold text-red-700 mb-6 text-center border-t pt-6 border-gray-200">
                    Your Recent Donation Requests
                </h2>

                {loadingRequests ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading your requests...</p>
                    </div>
                ) : errorFetchingRequests ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>Could not load your recent requests. Please try again later.</p>
                    </div>
                ) : recentRequests.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>You haven't made any donation requests yet. Start by creating one!</p>
                        {/* You might want to add a link to the donation request form here */}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentRequests.map((request) => (
                            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-center mb-3">
                                    <FaTint className="text-red-500 text-2xl mr-3" />
                                    <h3 className="text-xl font-bold text-gray-800">{request.bloodGroup} for {request.recipientName}</h3>
                                </div>
                                <p className="text-gray-700 mb-2 flex items-center">
                                    <FaHospital className="text-blue-500 mr-2" /> {request.hospitalName}
                                </p>
                                <p className="text-gray-700 mb-2 flex items-center">
                                    <FaMapMarkerAlt className="text-green-500 mr-2" /> {request.recipientStreet}, {request.recipientUpazila}, {request.recipientDistrict}
                                </p>
                                <p className="text-gray-700 mb-2 flex items-center">
                                    <FaCalendarAlt className="text-purple-500 mr-2" /> {formatDateTime(request.donationDate, request.donationTime)}
                                </p>
                                <p className="text-gray-700 text-sm italic mt-3">
                                    Status: <span className={`font-semibold ${request.donationStatus === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                                        {request.donationStatus.charAt(0).toUpperCase() + request.donationStatus.slice(1)}
                                    </span>
                                </p>
                                {request.requestMessage && (
                                    <p className="text-gray-600 text-sm mt-2 border-t border-gray-100 pt-2">
                                        "{request.requestMessage}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Requests Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/dashboard/all-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105"
                    >
                        View All My Requests
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboardHome;
