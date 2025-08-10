import React from 'react';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuth } from 'firebase/auth'; // Import getAuth for use in loader
import axios from 'axios'; // Import axios for error checking in loader

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
                // CORRECTED LOADER FOR EDIT DONATION REQUEST
                path: "edit-donation-request/:id", // Dynamic ID parameter
                element: <EditDonationRequest />,
                loader: async ({ params }) => { // Loader receives params
                    const auth = getAuth();
                    const user = auth.currentUser;

                    if (!user) {
                        return redirect('/auth/login');
                    }

                    const requestId = params.id; // Get the ID from URL params
                    if (!requestId) {
                        return { donationRequest: null, error: { message: "Donation Request ID is missing." } };
                    }

                    try {
                        // Fetch the specific donation request by ID
                        // This corresponds to your backend's GET /donationRequests/:id endpoint
                        const response = await axiosInstance.get(`/donationRequests/${requestId}`, {
                            headers: {
                                'Authorization': `Bearer ${await user.getIdToken()}`, // Ensure token is sent
                            },
                        });

                        // Important: Also check if the fetched request belongs to the current user
                        // This is a client-side security check, in addition to the backend's.
                        if (response.data.uid !== user.uid) {
                            // Redirect if the logged-in user is not the owner of this request
                            return redirect('/dashboard/my-donation-requests');
                        }

                        // Return the single donation request object
                        return { donationRequest: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching donation request for edit:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        // If 404, specifically return a not found error
                        if (axios.isAxiosError(error) && error.response?.status === 404) {
                            return { donationRequest: null, error: { message: "Donation request not found." } };
                        }
                        return { donationRequest: null, error: { message: errorMessage } };
                    }
                },

                hydrateFallbackElement: <Loading />,
            },


            {
                path: "all-users",
                element: <UserManagement />,
                loader: async () => {
                    const auth = getAuth(); // Get Firebase Auth instance
                    const user = auth.currentUser; // Get current user

                    if (!user) {
                        // If no user is logged in, redirect to login page
                        return redirect('/auth/login');
                    }

                    try {

                        console.log("Fetching all  user:", user.uid);
                        // FIX: Use user.uid correctly within the async loader
                        // axiosInstance's interceptor will automatically attach the ID token.
                        const response = await axiosInstance.get(`/all-users`);

                        // FIX: Return data in the format expected by useLoaderData
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching users:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />, // This is for SSR, generally fine here
            },
            // {
            //     path: "all-requests",
            //     element: <MyRequests />,
            // },
            {

                path: "all-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    const auth = getAuth(); // Get Firebase Auth instance
                    const user = auth.currentUser; // Get current user

                    if (!user) {
                        // If no user is logged in, redirect to login page
                        return redirect('/auth/login');
                    }

                    try {

                        console.log("Fetching all donation requests for user:", user.uid);
                        // FIX: Use user.uid correctly within the async loader
                        // axiosInstance's interceptor will automatically attach the ID token.
                        const response = await axiosInstance.get(`/my-donation-requests/${user.uid}`);

                        // FIX: Return data in the format expected by useLoaderData
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching my donations:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />, // This is for SSR, generally fine here
            },

            {

                path: "all-donation-requests",
                element: <ShowDonationRequests />,
                loader: async () => {
                    const auth = getAuth(); // Get Firebase Auth instance
                    const user = auth.currentUser; // Get current user

                    if (!user) {
                        // If no user is logged in, redirect to login page
                        return redirect('/auth/login');
                    }

                    try {

                        console.log("Fetching all donation requests for all user:");
                        // FIX: Use user.uid correctly within the async loader
                        // axiosInstance's interceptor will automatically attach the ID token.
                        const response = await axiosInstance.get(`/all-donation-requests`);

                        // FIX: Return data in the format expected by useLoaderData
                        return { myDonations: response.data, error: null };
                    } catch (error) {
                        console.error("Loader Error fetching my donations:", error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                            ? error.response.data.message
                            : error.message;
                        return { myDonations: [], error: { message: errorMessage } };
                    }
                },
                hydrateFallbackElement: <Loading />, // This is for SSR, generally fine here
            },

            // {
            //     path: "my-requests",
            //     element: <AllRequests />,

            // },
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
