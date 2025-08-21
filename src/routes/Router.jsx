import React from 'react';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import axios from 'axios';

import HomeLayouts from '../layouts/HomeLayouts';
import HomePageContent from '../pages/HomePage/HomePageContent';
import AuthLayout from '../layouts/AuthLayout';
import UserProfile from '../pages/UserProfile';
import Register from '../pages/Register';
import Login from '../pages/Login';
import PrivateRoute from '../provider/PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import DonationRequest from '../pages/DonationRequest';
import ShowDonationRequests from '../pages/ShowDonationRequests';
import axiosInstance from '../api/axiosInstance';
import Loading from '../pages/Loading';
import AboutUs from '../pages/AboutUs';
import NoRoute from '../pages/NoRoute';
import EditDonationRequest from '../pages/EditDonationRequest';
import UserManagement from '../pages/UserManagement';
import ContentManagement from '../pages/ContentManagement';
import AddABlog from '../pages/AddABlog';
import FindDonor from '../pages/FindDonor';
import Blogs from '../pages/Blogs';
import BlogDetail from '../pages/BlogDetail';
import Donate from '../pages/Donate';
import DonationRequestDetails from '../pages/DonationRequestDetails';

// New helper function to wait for Firebase auth to be ready
const getAuthReady = () => {
    const auth = getAuth();
    return new Promise(resolve => {
        // onAuthStateChanged is the most reliable way to know auth status.
        // It's called once immediately and then on every state change.
        const unsubscribe = onAuthStateChanged(auth, user => {
            // Once the user is received (or null), we know auth state is ready.
            unsubscribe(); // Clean up the listener
            resolve(user);
        });
    });
};


const Router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayouts />,
        children: [
            {
                path: "",
                element: <HomePageContent />,
            },
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path: "/auth/login",
                element: <Login />,
            },
            {
                path: "/auth/register",
                element: <Register />,
            },
            {
                path: "/auth/user-profile",
                element: (
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                ),
            },
            {
                path: "/auth/donate",
                element: (
                    <PrivateRoute>
                        <Donate />
                    </PrivateRoute>
                ),
            },
            {
                path: "/auth/show-request-details/:id",
                element: (
                    <PrivateRoute>
                        <DonationRequestDetails />
                    </PrivateRoute>
                ),
            }
        ],
    },

    {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: "create-donation-request",
                element: <DonationRequest />,
            },
            {
                path: "all-users",
                element: <UserManagement />,
                loader: async () => {
                    // Wait for the auth state to be ready before proceeding
                    const user = await getAuthReady();

                    if (!user) {
                        return redirect('/auth/login');
                    }

                    try {
                        console.log("Fetching all user:", user.uid);
                        const response = await axiosInstance.get(`/all-users`);
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching users:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            {
                path: "all-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    // Wait for the auth state to be ready before proceeding
                    const user = await getAuthReady();

                    if (!user) {
                        return redirect('/auth/login');
                    }

                    try {
                        console.log("Fetching all donation requests for user:", user.uid);
                        const response = await axiosInstance.get(`/my-donation-requests/${user.uid}`);
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching my donations:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            {
                path: "all-donation-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    // Wait for the auth state to be ready before proceeding
                    const user = await getAuthReady();

                    if (!user) {
                        return redirect('/auth/login');
                    }

                    try {
                        console.log("Fetching all donation requests for all user:");
                        const response = await axiosInstance.get(`/all-donation-requests`);
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching my donations:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            {
                path: "edit-donation-request/:id",
                element: <EditDonationRequest />,
                loader: async ({ params }) => {
                    // Wait for the auth state to be ready before proceeding
                    const user = await getAuthReady();

                    if (!user) {
                        return redirect('/auth/login');
                    }

                    const requestId = params.id;
                    console.log("Fetching donation request for edit with ID:", requestId);
                    if (!requestId) {
                        return { donationRequest: null, error: { message: "Donation Request ID is missing." } };
                    }

                    try {
                        const idToken = await user.getIdToken();
                        const roleResponse = await axiosInstance.get(`/get-user-role`, {
                            headers: {
                                'Authorization': `Bearer ${idToken}`,
                            },
                        });

                        const userRole = roleResponse.data.role;

                        const response = await axiosInstance.get(`/donationRequests/${requestId}`, {
                            headers: {
                                'Authorization': `Bearer ${await user.getIdToken()}`,
                            },
                        });

                        const isOwner = response.data.uid === user.uid;
                        const isAdmin = userRole === 'admin';

                        if (!isOwner && !isAdmin) {
                            return redirect('/dashboard/my-donation-requests');
                        }

                        return { donationRequest: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching donation request for edit:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        if (axios.isAxiosError(error) && error.response?.status === 404) {
                            return { donationRequest: null, error: { message: "Donation request not found." } };
                        }
                        return { donationRequest: null, error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            {
                path: "request-details/:id",
                element: <DonationRequestDetails />,
            },
            {
                path: "content-management",
                element: <ContentManagement />,
            },
            {
                path: "content-management/add-blog",
                element: <AddABlog />,
            },
            {
                path: "profile",
                element: <UserProfile />,
            },
        ],
    },
    {
        path: "/blogs",
        element: <Blogs />,
    },
    {
        path: "/blog-details/:id",
        element: <BlogDetail />,
    },
    {
        path: "/aboutus",
        element: <AboutUs />,
    },
    {
        path: "/search-donor",
        element: <FindDonor />,
    },
    {
        path: "/*",
        element: <NoRoute></NoRoute>,
    },
]);

export default Router;
