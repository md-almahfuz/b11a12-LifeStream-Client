import React from 'react';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
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
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: "create-donation-request",
                element: (
                    <PrivateRoute requiredRole="donor">
                        <DonationRequest />
                    </PrivateRoute>
                ),
            },
            {
                path: "all-users",
                element: (
                    // Use the PrivateRoute with requiredRole for admin-only pages
                    <PrivateRoute requiredRole="admin">
                        <UserManagement />
                    </PrivateRoute>
                ),
                loader: async () => {
                    const user = await getAuthReady();
                    if (!user) return redirect('/auth/login');
                    try {
                        const response = await axiosInstance.get(`/all-users`);
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            {
                path: "my-donation-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    const user = await getAuthReady();
                    if (!user) return redirect('/auth/login');
                    try {
                        const response = await axiosInstance.get(`/my-donation-requests/${user.uid}`);
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },
            // {
            //     path: "all-donation-requests",
            //     element: <ShowDonationRequests />,
            //     loader: async () => {
            //         const user = await getAuthReady();
            //         if (!user) return redirect('/auth/login');
            //         try {
            //             const response = await axiosInstance.get(`/all-donation-requests`);
            //             return { myDonations: response.data, error: null };
            //         } catch (error) {
            //             const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
            //                 ? error.response.data.message
            //                 : error.message;
            //             return { myDonations: [], error: { message: errorMessage } };
            //         }
            //     },
            //     hydrateFallbackElement: <Loading />,
            // },

            {
                path: "all-blood-donation-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    const user = await getAuthReady();
                    if (!user) {
                        // Redirect unauthenticated users
                        return redirect('/auth/login');
                    }

                    try {
                        // Fetch the donation requests
                        const donationRequestsResponse = await axiosInstance.get(`/all-donation-requests`);

                        // Fetch the user's role from the new backend endpoint
                        const userRoleResponse = await axiosInstance.get(`/get-user-role`);

                        // Return both the donation data and the user object with the role
                        return {
                            myDonations: donationRequestsResponse.data,
                            user: {
                                uid: user.uid,
                                role: userRoleResponse.data.role, // Use the role from the backend
                                status: userRoleResponse.data.status // Use the status from the backend
                            },
                            error: null
                        };
                    } catch (error) {
                        // Handle API errors
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;

                        // Return an error object along with the user data
                        return { myDonations: [], user: null, error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />,
            },

            // {
            //     path: "edit-donation-request/:id",
            //     element: <EditDonationRequest />,
            //     loader: async ({ params }) => {
            //         const user = await getAuthReady();
            //         if (!user) return redirect('/auth/login');
            //         const requestId = params.id;
            //         if (!requestId) return { donationRequest: null, error: { message: "Donation Request ID is missing." } };
            //         try {
            //             const idToken = await user.getIdToken();
            //             const roleResponse = await axiosInstance.get(`/get-user-role`, { headers: { 'Authorization': `Bearer ${idToken}` } });
            //             const userRole = roleResponse.data.role;
            //             const response = await axiosInstance.get(`/donationRequests/${requestId}`, { headers: { 'Authorization': `Bearer ${await user.getIdToken()}` } });
            //             const isOwner = response.data.uid === user.uid;
            //             const isAdmin = userRole === 'admin';
            //             if (!isOwner && !isAdmin) return redirect('/dashboard/my-donation-requests');
            //             return { donationRequest: response.data, error: null };
            //         } catch (error) {
            //             const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
            //                 ? error.response.data.message
            //                 : error.message;
            //             if (axios.isAxiosError(error) && error.response?.status === 404) return { donationRequest: null, error: { message: "Donation request not found." } };
            //             return { donationRequest: null, error: { message: errorMessage } };
            //         }
            //     },
            //     hydrateFallbackElement: <Loading />,
            // },
            {
                path: "edit-donation-request/:id",
                element: <PrivateRoute><EditDonationRequest /></PrivateRoute>,
                loader: async ({ params }) => {
                    const user = await getAuthReady();
                    if (!user) return redirect('/auth/login');
                    const requestId = params.id;
                    if (!requestId) return { donationRequest: null, error: { message: "Donation Request ID is missing." } };

                    try {
                        // First, fetch the user's role and wait for it
                        const idToken = await user.getIdToken();
                        const roleResponse = await axiosInstance.get(`/get-user-role`, { headers: { 'Authorization': `Bearer ${idToken}` } });
                        const userRole = roleResponse.data.role;

                        // Now, fetch the donation request
                        const response = await axiosInstance.get(`/donationRequests/${requestId}`, { headers: { 'Authorization': `Bearer ${idToken}` } });

                        // Now that we have both the request and the user's role, we can check permissions
                        const isOwner = response.data.uid === user.uid;
                        const isAdmin = userRole === 'admin';
                        const isVolunteer = userRole === 'volunteer';

                        if (!isOwner && !isAdmin && !isVolunteer) {
                            // Redirect if the user is neither the owner nor an admin
                            return redirect('/dashboard');
                        }

                        return { donationRequest: response.data, error: null };
                    } catch (error) {
                        // Error handling remains the same
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
                element: (
                    <PrivateRoute requiredRole="admin">
                        <ContentManagement />
                    </PrivateRoute>
                ),
            },
            {
                path: "content-management/add-blog",
                element: (
                    <PrivateRoute requiredRole="admin">
                        <AddABlog />
                    </PrivateRoute>
                ),
            },
            {
                path: "profile",
                element: <UserProfile />,
            },
        ],
    },
    {
        path: "/blogs-public",
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
