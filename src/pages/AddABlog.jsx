import React, { useState, useRef, useContext, useMemo } from 'react';
import JoditEditor from 'jodit-react'; // Import JoditEditor
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa'; // Icons for submit and cancel
import axios from 'axios';

const AddABlog = ({ placeholder = 'Start writing your blog content here...' }) => {
    const editor = useRef(null);
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [content, setContent] = useState(''); // Blog content from JoditEditor
    const [isSubmitting, setIsSubmitting] = useState(false);

    // JoditEditor configuration
    const config = useMemo(() => ({
        readonly: false, // all options from https://xdsoft.net/jodit/docs/classes/Config.html
        placeholder: placeholder,
        height: 400,
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'ul', 'ol', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'align', 'link', 'image', 'table', '|',
            'hr', 'eraser', 'copyformat', 'fullsize', 'selectall', 'print',
            '|', 'undo', 'redo'
        ],
        toolbarAdaptive: false, // Keep toolbar fixed
        showCharsCounter: true,
        showWordsCounter: true,
        showXPathInStatusbar: false,
    }), [placeholder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic client-side validation
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in the blog title and content.");
            setIsSubmitting(false);
            return;
        }

        if (!user) {
            toast.error("You must be logged in to add a blog.");
            setIsSubmitting(false);
            navigate('/auth/login');
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const newBlog = {
                title: title.trim(),
                thumbnail: thumbnail.trim(), // Can be empty if not provided
                content: content,
                authorUid: user.uid,
                authorName: user.displayName || user.email, // Fallback to email if displayName is null
                status: 'draft', // Default status for new blogs
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Send POST request to backend
            const response = await axiosInstance.post('/post-blog', newBlog, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success("Blog added successfully! It's currently in 'Draft' status.");
                navigate('/dashboard/content-management'); // Navigate back to blog list
            } else {
                throw new Error(response.data.message || 'Failed to add blog.');
            }

        } catch (error) {
            console.error("Error adding blog:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Failed to add blog: ${error.response.data.message}`);
            } else {
                toast.error(`Failed to add blog: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">Add New Blog Post</h1>
                    <p className="text-lg text-gray-600">Craft engaging content for your LifeStream community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">Blog Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    {/* Thumbnail URL Input */}
                    <div>
                        <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-semibold mb-2">Thumbnail Image URL (Optional)</label>
                        <input
                            type="url"
                            id="thumbnail"
                            name="thumbnail"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., https://example.com/image.jpg"
                        />
                    </div>

                    {/* Blog Content (JoditEditor) */}
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Blog Content</label>
                        <JoditEditor
                            ref={editor}
                            value={content}
                            config={config}
                            onBlur={newContent => setContent(newContent)} // Update state on blur
                            onChange={newContent => { }} // onChange is also available if you need real-time updates
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/content-management')}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Adding Blog...
                                </>
                            ) : (
                                <>
                                    Publish Blog <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddABlog; // Export name changed to AddABlog
