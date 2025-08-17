import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import Navbar from '../components/Navbar';

// A reusable component for a single blog post card
const BlogCard = ({ blog, handleCardClick }) => (
    <div
        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100 cursor-pointer"
        onClick={() => handleCardClick(blog)}
    >
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{blog.title}</h2>
            {/* The dangerouslySetInnerHTML prop is used to render raw HTML */}
            <div
                className="text-gray-700 text-base mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <div className="text-sm text-gray-500 mt-auto">
                <p>By {blog.authorEmail}</p>
                <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    </div>
);

// Component to display the full blog post content
const FullBlogView = ({ blog, handleBackClick }) => (
    <div className="bg-white rounded-xl shadow-lg p-8">
        <button
            onClick={handleBackClick}
            className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
            &larr; Back to all blogs
        </button>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{blog.title}</h1>
        <div className="text-sm text-gray-500 mb-8">
            <p>By {blog.authorEmail}</p>
            <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
);

// The main Blogs component
const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Listen for Firebase auth state changes
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthReady(true);
            if (!user) {
                setError('You must be logged in to view blog posts.');
                toast.error('You must be logged in to view blog posts.');
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (!isAuthReady) return;

            try {
                const response = await axiosInstance.get('/blogs');
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setBlogs(response.data);
                } else {
                    setError('No blog posts found.');
                }
            } catch (err) {
                console.error('Failed to fetch blogs:', err);
                setError('Failed to load blog posts. Please try again later.');
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                    toast.error(`Failed to load blogs: ${err.response.data.message}`);
                } else {
                    toast.error(`Failed to load blogs: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (isAuthReady) {
            fetchBlogs();
        }

    }, [isAuthReady]);

    const handleCardClick = (blog) => {
        setSelectedBlog(blog);
    };

    const handleBackClick = () => {
        setSelectedBlog(null);
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-12 min-h-screen my-10">
                {/* --- Conditional Rendering --- */}
                {selectedBlog ? (
                    <FullBlogView blog={selectedBlog} handleBackClick={handleBackClick} />
                ) : (
                    <>
                        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Latest Blog Posts</h1>
                        {loading && !error && (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                <p className="ml-4 text-xl text-gray-600">Loading blogs...</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-500 text-xl font-medium">
                                {error}
                            </div>
                        )}
                        {!loading && !error && blogs.length === 0 && (
                            <div className="text-center text-gray-500 text-xl">
                                No blog posts found.
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {!loading && !error && blogs.map(blog => (
                                <BlogCard key={blog._id} blog={blog} handleCardClick={handleCardClick} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Blogs;
