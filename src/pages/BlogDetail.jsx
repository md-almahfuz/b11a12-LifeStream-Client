import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'; // Assuming you use react-router-dom
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar'; // Import your Navbar component
import axiosInstance from '../api/axiosInstance';

const BlogDetail = () => {
    // Assuming you have a route like '/blogs/:id' and use useParams
    // If not, you'll need to pass the blogId as a prop
    const { id } = useParams();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Fetch a single blog post using its ID
                const response = await axiosInstance.get(`/blogs/${id}`);
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
            <div className="flex justify-center items-center h-screen">
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

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{blog.title}</h1>
                    <div className="text-sm text-gray-500 mb-8">
                        <p>By {blog.authorEmail}</p>
                        <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </div>
                    {/* Render the full HTML content */}
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
