import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaEdit, FaTimesCircle, FaCheckCircle, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const DonorDashboardHome = () => {
    // Correctly get 'user' and 'loading' states from AuthContext
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recentRequests, setRecentRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [errorFetchingRequests, setErrorFetchingRequests] = useState(false);

    // Fetch recent donation requests for the logged-in donor
    useEffect(() => {
        const fetchRecentDonationRequests = async () => {
            // Wait for user and loading state to be ready
            if (!user || loading) {
                // If loading, just return. The effect will re-run when loading is false.
                // If no user, we don't need to fetch requests.
                setRequestsLoading(false);
                return;
            }

            setRequestsLoading(true);
            setErrorFetchingRequests(false);

            try {
                // Get the ID token directly from the user object
                const idToken = await user.getIdToken();
                if (!idToken) {
                    throw new Error("Authentication token not available. Please log in again.");
                }

                // Corrected API endpoint to match your backend route
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
                setRequestsLoading(false);
            }
        };

        fetchRecentDonationRequests();
    }, [user, loading]); // Added loading to dependency array

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'N/A';
        try {
            const dateTimeString = `${date}T${time}:00`;
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

    const handleViewRequest = (requestId) => {
        navigate(`/dashboard/request-details/${requestId}`);
    };

    const handleEditRequest = (requestId) => {
        navigate(`/dashboard/edit-donation-request/${requestId}`);
    };

    const handleCancelRequest = async (requestId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Cancel Request!",
            cancelButtonText: "No"
        });

        if (result.isConfirmed) {
            try {
                const idToken = await user.getIdToken();
                await axiosInstance.delete(`/donationRequests/${requestId}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });
                toast.success('Donation request canceled successfully!');
                setRecentRequests(prev => prev.filter(req => req._id !== requestId));
            } catch (error) {
                console.error('Failed to cancel request:', error);
                toast.error('Failed to cancel the request. Please try again.');
            }
        }
    };

    const handleCompleteRequest = async (requestId) => {
        const result = await Swal.fire({
            title: "Mark as completed?",
            text: "This will finalize the donation request.",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, complete it!"
        });

        if (result.isConfirmed) {
            try {
                const idToken = await user.getIdToken();
                await axiosInstance.put(`/donationRequests/complete/${requestId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });
                toast.success('Donation marked as completed!');
                setRecentRequests(prev => prev.map(req =>
                    req._id === requestId ? { ...req, donationStatus: 'completed' } : req
                ));
            } catch (error) {
                console.error('Failed to complete request:', error);
                toast.error('Failed to mark as completed. Please try again.');
            }
        }
    };

    if (requestsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
                        Welcome, {user?.displayName || 'LifeStream Donor'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for being a vital part of our community. Your generosity saves lives!
                    </p>
                </div>

                <h2 className="text-3xl font-bold text-red-700 mb-6 text-center border-t pt-6 border-gray-200">
                    Your Recent Donation Requests
                </h2>

                {errorFetchingRequests ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>Could not load your recent requests. Please try again later.</p>
                    </div>
                ) : recentRequests.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>You haven't made any donation requests yet. Start by creating one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentRequests.map((request) => (
                            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                                <div className="flex-grow">
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
                                        Status: <span className={`font-semibold ${request.donationStatus === 'pending' ? 'text-orange-500' : request.donationStatus === 'inProgress' ? 'text-blue-500' : 'text-green-600'}`}>
                                            {request.donationStatus.charAt(0).toUpperCase() + request.donationStatus.slice(1)}
                                        </span>
                                    </p>
                                    {request.requestMessage && (
                                        <p className="text-gray-600 text-sm mt-2 border-t border-gray-100 pt-2">
                                            "{request.requestMessage}"
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex w-full justify-end gap-1">
                                    {request.donationStatus === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleViewRequest(request._id)}
                                                className="flex-shrink-0 flex items-center bg-gray-500 text-white rounded-md px-2 py-1 text-sm hover:bg-gray-600 transition-colors"
                                            >
                                                <FaEye className="mr-1" /> View
                                            </button>
                                            <button
                                                onClick={() => handleEditRequest(request._id)}
                                                className="flex-shrink-0 flex items-center bg-blue-500 text-white rounded-md px-2 py-1 text-sm hover:bg-blue-600 transition-colors"
                                            >
                                                <FaEdit className="mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleCancelRequest(request._id)}
                                                className="flex-shrink-0 flex items-center bg-red-500 text-white rounded-md px-2 py-1 text-sm hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimesCircle className="mr-1" /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {request.donationStatus === 'inProgress' && (
                                        <>
                                            <button
                                                onClick={() => handleCompleteRequest(request._id)}
                                                className="flex items-center btn-sm bg-green-500 text-white rounded-md px-3 py-1 text-sm hover:bg-green-600 transition-colors"
                                            >
                                                <FaCheckCircle className="mr-1" /> Complete
                                            </button>
                                            <button
                                                onClick={() => handleCancelRequest(request._id)}
                                                className="flex items-center btn-sm bg-red-500 text-white rounded-md px-3 py-1 text-sm hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimesCircle className="mr-1" /> Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
