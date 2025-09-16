import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { FaUserCheck, FaUserSlash, FaUserTie, FaUserShield, FaSpinner, FaFilePdf } from 'react-icons/fa';
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

const UserManagement = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

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

    // This is the corrected and crucial part of the code
    // Filtered users based on selected status
    const filteredUsers = users.filter(u => {
        if (filterStatus === 'all') {
            return true;
        }
        return u.status === filterStatus;
    });

    // Pagination logic moved here to ensure filteredUsers is defined
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Total number of pages
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
            const title = "LifeStream User Report";
            const headers = [['Name', 'Email', 'Role', 'Status']];

            const data = filteredUsers.map(user => [
                user.name || 'N/A',
                user.email || 'N/A',
                user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'N/A',
                user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'N/A'
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
                headStyles: { fillColor: [71, 85, 105], textColor: 255 },
                theme: 'striped',
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                }
            });

            doc.save('lifestream-users.pdf');
            Swal.close();
            toast.success('PDF generated successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            Swal.close();
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

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

            if (!result.isConfirmed) {
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
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1); // Reset to the first page when filter changes
                            }}
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
                                {currentUsers.map((u) => (
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
                                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
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

export default UserManagement;