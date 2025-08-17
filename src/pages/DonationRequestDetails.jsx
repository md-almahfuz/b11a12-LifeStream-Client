import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FaMapMarkerAlt, FaUser, FaHospital, FaCalendarAlt, FaClock, FaEnvelope, FaTint } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axiosInstance from '../api/axiosInstance'; // Assuming this is your configured Axios instance
import { toast } from 'react-toastify';

// The main component for the Donation Request Details page
const DonationRequestDetails = () => {
    // State variables to manage the UI and data
    const { id } = useParams(); // Get the donation request ID from the URL
    const [request, setRequest] = useState(null); // State for the donation request data
    const [loading, setLoading] = useState(true); // Loading state for data fetching
    const [error, setError] = useState(null); // Error state
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
    const [donorInfo, setDonorInfo] = useState({ name: '', email: '' }); // State for the logged-in donor's info
    const [isConfirming, setIsConfirming] = useState(false); // State to track confirmation status

    console.log(request);

    // Effect to fetch donation request details when the component mounts or the ID changes
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await axiosInstance.get(`/donationRequests/${id}`);
                setRequest(response.data);
            } catch (err) {
                setError('Failed to fetch donation request details. Please try again.');
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Set the donor's name and email from the authenticated user
                setDonorInfo({
                    name: user.displayName || 'Anonymous',
                    email: user.email,
                });
            }
        });

        if (id) {
            fetchRequest();
        }

        return () => unsubscribe();
    }, [id]);

    // Handler to open the confirmation modal
    const handleDonateClick = () => {
        setIsModalOpen(true);
    };

    // Handler to close the confirmation modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handler for confirming the donation and updating the status
    const handleConfirmDonation = async () => {
        setIsConfirming(true);
        try {
            // Update the donation request status to 'pending' on the backend
            // You will need to create a PUT endpoint on your backend to handle this.
            // Example PUT endpoint: /donationRequests/pending/:id
            await axiosInstance.put(`/donationRequests/pending/${id}`, {
                donorName: donorInfo.name,
                donorEmail: donorInfo.email,
            });

            toast.success("Donation confirmed! The request status has been updated.");

            // Optionally, refresh the data to show the new status
            // For example, by calling fetchRequest() again
            setRequest(prev => ({ ...prev, donationStatus: 'pending' }));

            handleCloseModal();
        } catch (err) {
            toast.error("Failed to confirm donation. Please try again.");
            console.error('Donation confirmation failed:', err);
        } finally {
            setIsConfirming(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner text-primary"></span>
                <p className="ml-2 text-gray-600">Loading donation request...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Main content for the donation request details
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center py-30">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Donation Request Details</h1>

                {request && (
                    <div className="space-y-6">
                        {/* Recipient Information */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-bold text-blue-800 flex items-center mb-4">
                                <FaUser className="mr-2" /> Recipient
                            </h2>
                            <p className="text-gray-700 font-medium">Name: <span className="font-normal">{request.recipientName}</span></p>
                            <p className="text-gray-700 font-medium flex items-center">
                                Blood Group: <FaTint className="text-red-500 ml-2 mr-1" />
                                <span className="font-bold text-red-600">{request.bloodGroup}</span>
                            </p>
                            <p className="text-gray-700 font-medium">Contact: <span className="font-normal">{request.requesterEmail}</span></p>
                        </div>

                        {/* Location and Time Information */}
                        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                                <FaMapMarkerAlt className="mr-2" /> Location & Time
                            </h2>
                            <p className="text-gray-700 font-medium flex items-center">
                                <FaHospital className="mr-2" /> Hospital: <span className="font-normal ml-1">{request.hospitalName}</span>
                            </p>
                            <p className="text-gray-700 font-medium">Address: <span className="font-normal">{request.recipientStreet}</span></p>
                            <p className="text-gray-700 font-medium">District: <span className="font-normal">{request.recipientDistrict}, {request.recipientUpazila}</span></p>
                            <p className="text-gray-700 font-medium flex items-center">
                                <FaCalendarAlt className="mr-2" /> Date: <span className="font-normal ml-1">{new Date(request.donationDate).toLocaleDateString()}</span>
                            </p>
                            <p className="text-gray-700 font-medium flex items-center">
                                <FaClock className="mr-2" /> Time: <span className="font-normal ml-1">{request.donationTime}</span>
                            </p>
                        </div>

                        {/* Donation Status */}
                        <div className="text-center mt-6">
                            <span className={`px-4 py-2 rounded-full font-bold text-white
                                ${request.donationStatus === 'pending' ? 'bg-yellow-500' :
                                    request.donationStatus === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}`}>
                                Status: {request.donationStatus}
                            </span>
                        </div>

                        {/* Donate Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleDonateClick}
                                className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
                                disabled={request.donationStatus !== 'open'}
                            >
                                Donate Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Donation Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Confirm Your Donation</h3>
                        <p className="text-gray-700 mb-4">You are about to confirm your donation to this request. The request status will be updated to "pending".</p>

                        <div className="space-y-2 mb-6">
                            <p className="font-medium text-gray-800">Your Name: <span className="font-normal">{donorInfo.name}</span></p>
                            <p className="font-medium text-gray-800">Your Email: <span className="font-normal">{donorInfo.email}</span></p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDonation}
                                disabled={isConfirming}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isConfirming ? "Confirming..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationRequestDetails;
