import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useLoaderData, useNavigate } from 'react-router';
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaEdit, FaUserCircle, FaEnvelope, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';

// Load jsPDF and jspdf-autotable from CDN for client-side PDF generation
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};
// Component to display the user's donation requests
const ShowDonationRequests = () => {
    const { myDonations, error } = useLoaderData();
    const navigate = useNavigate();

    // New state for filter status, default to 'all'
    const [filterStatus, setFilterStatus] = useState('all');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Show 10 items per page

    // Handle loading and error states
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

    // Function to format date and time nicely
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
        console.log("Editing request with ID:", requestId);
        navigate(`/dashboard/edit-donation-request/${requestId}`);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1); // Reset to the first page on filter change
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Filter the donations based on the selected status
    const filteredDonations = myDonations.filter(donation => {
        if (filterStatus === 'all') {
            return true;
        }
        const statusToCheck = filterStatus === 'done' ? 'completed' : filterStatus;
        return donation.donationStatus?.toLowerCase() === statusToCheck.toLowerCase();
    });

    // Pagination logic (moved here to be after filtering)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);


    // Function to generate and download PDF
    const handleDownloadPdf = async () => {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js');
        const { jsPDF } = window.jspdf;

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
            const title = "My Donation Requests Report";
            const headers = [['Recipient', 'Blood Group', 'Date & Time', 'Hospital', 'Location', 'Status']];

            const data = filteredDonations.map(donation => [
                donation.recipientName || 'N/A',
                donation.bloodGroup || 'N/A',
                formatDateTime(donation.donationDate, donation.donationTime),
                donation.hospitalName || 'N/A',
                `${donation.recipientStreet || 'N/A'}, ${donation.recipientUpazila || 'N/A'}, ${donation.recipientDistrict || 'N/A'}`,
                donation.donationStatus ? (donation.donationStatus.charAt(0).toUpperCase() + donation.donationStatus.slice(1)) : 'N/A'
            ]);

            doc.setFontSize(20);
            doc.text(title, 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${date}`, 14, 26);

            doc.autoTable({
                startY: 35,
                head: headers,
                body: data,
                styles: { fontSize: 10, cellPadding: 2 },
                headStyles: { fillColor: [59, 130, 246], textColor: 255 },
                theme: 'striped',
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 50 },
                    5: { cellWidth: 20 }
                }
            });

            doc.save('my-donations-report.pdf');
            Swal.close();
            toast.success('PDF generated successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            Swal.close();
            toast.error('Failed to generate PDF. Please try again.');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Donation History</h1>
                    <p className="text-lg text-gray-600">A record of your invaluable contributions.</p>
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
                            onChange={handleFilterChange}
                            className="select select-bordered w-full max-w-xs px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="InProgress">InProgress</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
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
                                    <th className="p-3 text-left">Donor Info</th>
                                    <th className="p-3 text-left rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((donation) => (
                                    <tr key={donation._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{donation.recipientName || 'N/A'}</td>
                                        <td className="p-3 flex items-center"><FaTint className="text-red-500 mr-2" /><span className="font-bold">{donation.bloodGroup || 'N/A'}</span></td>
                                        <td className="p-3"><div className="flex items-center"><FaCalendarAlt className="text-purple-500 mr-2" />{formatDateTime(donation.donationDate, donation.donationTime)}</div></td>
                                        <td className="p-3 flex items-center"><FaHospital className="text-blue-500 mr-2" />{donation.hospitalName || 'N/A'}</td>
                                        <td className="p-3"><div className="flex items-center"><FaMapMarkerAlt className="text-green-500 mr-2" />{donation.recipientStreet || 'N/A'}, {donation.recipientUpazila || 'N/A'}, {donation.recipientDistrict || 'N/A'}</div></td>
                                        <td className="p-3"><span className={`font-semibold ${donation.donationStatus === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>{donation.donationStatus ? (donation.donationStatus.charAt(0).toUpperCase() + donation.donationStatus.slice(1)) : 'N/A'}</span></td>

                                        {/* Column for Donor Info */}
                                        <td className="p-3 text-gray-700">
                                            {donation.donationStatus === 'inProgress' && donation.donorName && donation.donorEmail ? (
                                                <div className="flex flex-col items-start space-y-1">
                                                    <div className="flex items-center">
                                                        <FaUserCircle className="text-gray-500 mr-2" />
                                                        <span>{donation.donorName}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaEnvelope className="text-gray-500 mr-2" />
                                                        <span>{donation.donorEmail}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </td>
                                        {/* <td className="p-3">
                                            {donation.donationStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleEditClick(donation._id)}
                                                    className="btn btn-sm btn-info text-white hover:bg-blue-700 transition-colors duration-200"
                                                    title="Edit Request"
                                                >
                                                    <FaEdit className="mr-1" /> Edit
                                                </button>
                                            )}
                                        </td> */}

                                        <td className="p-3">
                                            {(donation.donationStatus === 'pending' || donation.donationStatus === 'inProgress') && (
                                                <button
                                                    onClick={() => handleEditClick(donation._id)}
                                                    className="btn btn-sm btn-info text-white hover:bg-blue-700 transition-colors duration-200"
                                                    title="Edit Request"
                                                >
                                                    <FaEdit className="mr-1" /> Edit
                                                </button>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowDonationRequests;