import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import axios from 'axios';

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Use standard axios for public endpoint
                const response = await axios.get(`https://b11a12-lifestream-server.vercel.app/blogs-public/${id}`);
                setBlog(response.data);
            } catch (err) {
                console.error('Failed to fetch blog post:', err);
                setError('Failed to load blog post. It might not exist.');
                toast.error('Failed to load blog post.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        } else {
            setError('No blog post ID provided.');
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-xl text-gray-600">Loading blog post...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 text-xl font-medium mt-12">
                {error}
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center text-gray-500 text-xl mt-12">
                Blog post not found.
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Thumbnail Section */}
                    {blog.thumbnail && (
                        <div className="relative w-full h-64 overflow-hidden">
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/800x400/E5E7EB/4B5563?text=Image+Not+Found";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        </div>
                    )}
                    <div className="p-8 md:p-12">
                        {/* Back button */}
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6 font-medium"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Blogs
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="text-sm text-gray-500 mb-8 flex flex-wrap gap-x-4">
                            <p className="mb-1">By {blog.authorEmail}</p>
                            <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
                        </div>
                        {/* Blog Content Section */}
                        <div className="prose max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
