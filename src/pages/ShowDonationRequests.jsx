import React, { useState } from 'react'; // Added useState for filter
import { toast } from 'react-toastify';
import { useLoaderData, useNavigate } from 'react-router';
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaEdit } from 'react-icons/fa';
import axios from 'axios';

const ShowDonationRequests = () => {
    const { myDonations, error } = useLoaderData();
    const navigate = useNavigate();

    // New state for filter status, default to 'all'
    const [filterStatus, setFilterStatus] = useState('all');

    if (error) {
        toast.error(`Error loading donations: ${error.message}`);
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans flex items-center justify-center">
                <div className="text-center text-red-500 text-lg py-10">
                    <p>Could not load your donation history. Please try again later.</p>
                    <p className="text-sm">Details: {error.message}</p>
                </div>
            </div>
        );
    }

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

    const handleEditClick = (requestId) => {
        navigate(`/dashboard/edit-donation-request/${requestId}`);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    // Filter the donations based on the selected status
    const filteredDonations = myDonations.filter(donation => {
        if (filterStatus === 'all') {
            return true; // Show all donations
        }
        // Map 'done' to 'completed' for filtering if your DB uses 'completed'
        const statusToCheck = filterStatus === 'done' ? 'completed' : filterStatus;
        return donation.donationStatus === statusToCheck;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">My Donation History</h1>
                    <p className="text-lg text-gray-600">A record of your invaluable contributions.</p>
                </div>

                {/* Filter Dropdown */}
                <div className="mb-6 flex justify-end items-center">
                    <label htmlFor="statusFilter" className="block text-gray-700 text-sm font-semibold mr-3">Filter by Status:</label>
                    <select
                        id="statusFilter"
                        name="statusFilter"
                        value={filterStatus}
                        onChange={handleFilterChange}
                        className="select select-bordered w-full max-w-xs px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option> {/* Changed 'done' to 'completed' for consistency with backend */}
                        <option value="canceled">Canceled</option>
                    </select>
                </div>

                {filteredDonations.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>No donations found with status "{filterStatus}".</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full border-collapse">
                            {/* Head */}
                            <thead className="bg-blue-100 text-blue-800 uppercase text-sm">
                                <tr>
                                    <th className="p-3 text-left rounded-tl-lg">Recipient</th>
                                    <th className="p-3 text-left">Blood Group</th>
                                    <th className="p-3 text-left">Date & Time</th>
                                    <th className="p-3 text-left">Hospital</th>
                                    <th className="p-3 text-left">Location</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDonations.map((donation) => ( // Use filteredDonations here
                                    <tr key={donation._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{donation.recipientName || 'N/A'}</td>
                                        <td className="p-3 flex items-center"><FaTint className="text-red-500 mr-2" /><span className="font-bold">{donation.bloodGroup || 'N/A'}</span></td>
                                        <td className="p-3"><div className="flex items-center"><FaCalendarAlt className="text-purple-500 mr-2" />{formatDateTime(donation.donationDate, donation.donationTime)}</div></td>
                                        <td className="p-3 flex items-center"><FaHospital className="text-blue-500 mr-2" />{donation.hospitalName || 'N/A'}</td>
                                        <td className="p-3"><div className="flex items-center"><FaMapMarkerAlt className="text-green-500 mr-2" />{donation.recipientStreet || 'N/A'}, {donation.recipientUpazila || 'N/A'}, {donation.recipientDistrict || 'N/A'}</div></td>
                                        <td className="p-3"><span className={`font-semibold ${donation.donationStatus === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>{donation.donationStatus ? (donation.donationStatus.charAt(0).toUpperCase() + donation.donationStatus.slice(1)) : 'N/A'}</span></td>
                                        <td className="p-3">
                                            {/* Only show edit for 'pending' requests, for example */}
                                            {donation.donationStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleEditClick(donation._id)}
                                                    className="btn btn-sm btn-info text-white hover:bg-blue-700 transition-colors duration-200"
                                                    title="Edit Request"
                                                >
                                                    <FaEdit className="mr-1" /> Edit
                                                </button>
                                            )}
                                            {/* You might add a 'View Details' button for completed ones */}
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

export default ShowDonationRequests;
