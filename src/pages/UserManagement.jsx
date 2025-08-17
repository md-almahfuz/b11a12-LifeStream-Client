import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaUserCheck, FaUserSlash, FaUserTie, FaUserShield, FaSpinner } from 'react-icons/fa'; // Icons for actions
import axios from 'axios'; // For axios.isAxiosError

const UserManagement = () => { // Component name changed from ShowUsers to UserManagement
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'blocked'
    const [updatingUserId, setUpdatingUserId] = useState(null); // To disable buttons during update

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
    }, [user]); // Re-fetch users if the user context changes

    // Filtered users based on selected status
    const filteredUsers = users.filter(u => {
        if (filterStatus === 'all') {
            return true;
        }
        return u.status === filterStatus;
    });

    // // Handle status toggle (Block/Unblock)
    // const handleToggleStatus = async (userId, currentStatus) => {
    //     setUpdatingUserId(userId); // Set ID to disable buttons for this row
    //     try {
    //         const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    //         const idToken = await getFirebaseIdToken();

    //         await axiosInstance.put(`/toggle-user-status/${userId}`, { status: newStatus }, {
    //             headers: { 'Authorization': `Bearer ${idToken}` }
    //         });

    //         // Update local state immediately after successful backend update
    //         setUsers(prevUsers => prevUsers.map(u =>
    //             u._id === userId ? { ...u, status: newStatus } : u
    //         ));
    //         toast.success(`User status updated to '${newStatus}'.`);
    //     } catch (err) {
    //         console.error("Error updating user status:", err);
    //         if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
    //             toast.error(`Failed to update status: ${err.response.data.message}`);
    //         } else {
    //             toast.error(`Failed to update status: ${err.message}`);
    //         }
    //     } finally {
    //         setUpdatingUserId(null); // Re-enable buttons
    //     }
    // };

    // Function to handle toggling a user's status
    const handleToggleStatus = async (userId, currentStatus) => {
        console.log("Toggling status for user ID:", userId);
        setUpdatingUserId(userId); // Set ID to disable buttons for this row

        try {
            const idToken = await getFirebaseIdToken();

            // Determine the new status
            const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

            // IMPORTANT: The backend API expects a JSON body with a 'newStatus' key
            await axiosInstance.put(`/toggle-user-status/${userId}`, {
                newStatus: newStatus // Corrected key from 'status' to 'newStatus'
            }, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Update local state immediately after successful backend update
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
            setUpdatingUserId(null); // Re-enable buttons
        }
    };



    // Handle role change
    const handleChangeRole = async (userId, newRole) => {
        console.log("Changing role for user ID:", userId, "to new role:", newRole);
        setUpdatingUserId(userId); // Set ID to disable buttons for this row
        try {
            const idToken = await getFirebaseIdToken();

            // The backend requires both `role` and `status`
            const newStatus = 'active'; // You can get this from a form field if you want more control

            await axiosInstance.put(`/set-user-role/${userId}`, {
                role: newRole,
                status: newStatus // Add the status here
            }, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Update local state immediately after successful backend update
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
            setUpdatingUserId(null); // Re-enable buttons
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">Manage All Users</h1>
                    <p className="text-lg text-gray-600">Overview and control of user accounts on LifeStream.</p>
                </div>

                {/* Filter Dropdown */}
                <div className="mb-6 flex justify-end items-center">
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
                        <table className="table w-full border-collapse">
                            {/* Head */}
                            <thead className="bg-indigo-100 text-indigo-800 uppercase text-sm">
                                <tr>
                                    <th className="p-3 text-left rounded-tl-lg">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Role</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
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

export default UserManagement; // Export name changed to UserManagement
