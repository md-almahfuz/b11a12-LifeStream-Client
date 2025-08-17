import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router';
import { FaPlus, FaEye, FaEyeSlash, FaTrashAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Icons for actions and status
import axios from 'axios';

const ContentManagement = () => { // Component name changed to ContentManagement
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'draft', 'published', 'unpublished'
    const [updatingBlogId, setUpdatingBlogId] = useState(null); // To disable buttons during update

    // Function to fetch all blogs
    const fetchBlogs = async () => {
        if (!user) {
            setLoading(false);
            setError({ message: "User not authenticated." });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // The axiosInstance interceptor handles attaching the token
            const response = await axiosInstance.get('/blogs');
            setBlogs(response.data);
        } catch (err) {
            console.error("Error fetching blogs:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                setError({ message: err.response.data.message });
                toast.error(`Failed to load blogs: ${err.response.data.message}`);
            } else {
                setError({ message: "Failed to load blogs. Please try again." });
                toast.error(`Failed to load blogs: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch blogs on component mount and when user changes
    useEffect(() => {
        fetchBlogs();
    }, [user]); // Re-fetch blogs if the user context changes

    // Filtered blogs based on selected status
    const filteredBlogs = blogs.filter(blog => {
        if (filterStatus === 'all') {
            return true;
        }
        return blog.status === filterStatus;
    });

    // Handle "Add Blog" button click
    const handleAddBlogClick = () => {
        navigate('/dashboard/content-management/add-blog');
    };

    // Handle status toggle (Publish/Unpublish)
    const handleToggleStatus = async (blogId, currentStatus) => {
        setUpdatingBlogId(blogId); // Set ID to disable buttons for this row
        try {
            let newStatus;
            if (currentStatus === 'draft' || currentStatus === 'unpublished') {
                newStatus = 'published';
            } else if (currentStatus === 'published') {
                newStatus = 'unpublished';
            } else {
                // Should not happen if statuses are controlled
                toast.error("Invalid current status.");
                return;
            }

            const idToken = await getFirebaseIdToken();

            await axiosInstance.put(`/toggle-blog-status/${blogId}`, { status: newStatus }, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Update local state immediately after successful backend update
            setBlogs(prevBlogs => prevBlogs.map(blog =>
                blog._id === blogId ? { ...blog, status: newStatus, updatedAt: new Date().toISOString() } : blog
            ));
            toast.success(`Blog status changed to '${newStatus}'.`);
        } catch (err) {
            console.error("Error updating blog status:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                toast.error(`Failed to update status: ${err.response.data.message}`);
            } else {
                toast.error(`Failed to update status: ${err.message}`);
            }
        } finally {
            setUpdatingBlogId(null); // Re-enable buttons
        }
    };

    // Handle Delete Blog
    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
            return; // User cancelled
        }

        setUpdatingBlogId(blogId); // Set ID to disable buttons for this row
        try {
            const idToken = await getFirebaseIdToken();

            await axiosInstance.delete(`/admin/blogs/${blogId}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Remove blog from local state immediately after successful backend delete
            setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
            toast.success("Blog deleted successfully!");
        } catch (err) {
            console.error("Error deleting blog:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                toast.error(`Failed to delete blog: ${err.response.data.message}`);
            } else {
                toast.error(`Failed to delete blog: ${err.message}`);
            }
        } finally {
            setUpdatingBlogId(null); // Re-enable buttons
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'draft': return <span className="text-gray-500 font-semibold flex items-center"><FaEyeSlash className="mr-1" /> Draft</span>;
            case 'published': return <span className="text-green-600 font-semibold flex items-center"><FaCheckCircle className="mr-1" /> Published</span>;
            case 'unpublished': return <span className="text-orange-500 font-semibold flex items-center"><FaTimesCircle className="mr-1" /> Unpublished</span>;
            default: return <span className="text-gray-400">N/A</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-800">Content Management</h1>
                    <button
                        onClick={handleAddBlogClick}
                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center"
                    >
                        <FaPlus className="mr-2" /> Add New Blog
                    </button>
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
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading blogs...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>{error.message}</p>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>No blogs found matching the filter criteria.</p>
                        <p className="mt-2">Click "Add New Blog" to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full border-collapse">
                            {/* Head */}
                            <thead className="bg-indigo-100 text-indigo-800 uppercase text-sm">
                                <tr>
                                    <th className="p-3 text-left rounded-tl-lg">Title</th>
                                    <th className="p-3 text-left">Author</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Created At</th>
                                    <th className="p-3 text-left rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBlogs.map((blog) => (
                                    <tr key={blog._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{blog.title || 'N/A'}</td>
                                        <td className="p-3 text-gray-700">{blog.authorName || 'N/A'}</td>
                                        <td className="p-3">{getStatusDisplay(blog.status)}</td>
                                        <td className="p-3 text-gray-700">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 space-x-2">
                                            {/* Status Toggle Button */}
                                            <button
                                                onClick={() => handleToggleStatus(blog._id, blog.status)}
                                                className={`btn btn-sm ${blog.status === 'published' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors duration-200`}
                                                disabled={updatingBlogId === blog._id}
                                            >
                                                {updatingBlogId === blog._id ? <FaSpinner className="animate-spin" /> : (
                                                    blog.status === 'published' ? <FaEyeSlash /> : <FaEye />
                                                )}
                                                <span className="ml-1">
                                                    {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                                </span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteBlog(blog._id)}
                                                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                                                disabled={updatingBlogId === blog._id}
                                            >
                                                {updatingBlogId === blog._id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                                                <span className="ml-1">Delete</span>
                                            </button>
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

export default ContentManagement; // Export name changed to ContentManagement
