import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Assuming AuthContext is in ../provider/AuthProvider
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { useNavigate } from 'react-router'; // For navigation after submission (changed from 'react-router')
import { FaPaperPlane } from 'react-icons/fa'; // Icon for submit button
import axios from 'axios'; // Import axios for isAxiosError check

const DonationRequest = () => {
    // Access user and token functions from AuthContext
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        uid: '', // Firebase User ID
        requesterName: '', // From Firebase user.displayName
        requesterEmail: '', // From Firebase user.email
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        //donorName: '', // Optional, can be filled later by donor
        //donorEmail: '', // Optional, can be filled later by donor
        // donationStatus: 'pending' (default, not shown on form)
    });

    // State for user's status from DB
    const [userStatus, setUserStatus] = useState(null); // e.g., 'active', 'blocked'
    const [isLoadingUserStatus, setIsLoadingUserStatus] = useState(true);

    // State for location data dropdowns
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true); // Loading state for location data

    const [isSubmitting, setIsSubmitting] = useState(false); // To prevent multiple submissions

    // --- EFFECT 1: Load user data from Firebase Auth and DB (including status) ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (user && user.uid) {
                setIsLoadingUserStatus(true);
                console.log("DonationRequest: Current user object:", user);
                console.log("DonationRequest: user.displayName:", user.displayName);
                console.log("DonationRequest: user.email:", user.email);
                console.log("Loading user data from DB for UID:", user.uid);

                try {
                    // Fetch additional user data from your backend
                    const userRes = await axiosInstance.get(`/user/${user.uid}`);
                    const userDataFromDB = userRes.data;

                    setFormData(prev => ({
                        ...prev,
                        uid: user.uid || '',
                        requesterName: userDataFromDB.name || user.displayName || '', // Prioritize DB name, fallback to Firebase Auth
                        requesterEmail: userDataFromDB.email || user.email || '', // Prioritize DB email, fallback to Firebase Auth
                        // Initialize other fields from DB if they exist in user profile
                        bloodGroup: userDataFromDB.bloodGroup || '',
                        recipientDistrict: userDataFromDB.district || '',
                        recipientUpazila: userDataFromDB.upazila || '',
                    }));
                    setUserStatus(userDataFromDB.status || 'active'); // Default to 'active' if not found
                } catch (error) {
                    console.error("Failed to load user data from DB:", error);
                    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                        console.warn("User data not found in DB, initializing from Firebase Auth and setting status to active.");
                        setFormData(prev => ({
                            ...prev,
                            uid: user.uid || '',
                            requesterName: user.displayName || '',
                            requesterEmail: user.email || '',
                        }));
                        setUserStatus('active'); // Assume active if no DB record found
                    } else {
                        toast.error("Failed to load your profile status.");
                        setUserStatus('unknown'); // Set to 'unknown' or 'error' status
                    }
                } finally {
                    setIsLoadingUserStatus(false);
                }
            } else {
                // If user is not logged in, set loading to false and redirect
                setIsLoadingUserStatus(false);
                navigate('/auth/login');
            }
        };
        fetchUserData();
    }, [user, navigate]); // Depend on 'user' to re-fetch if user object changes

    // --- EFFECT 2: Load static location data ---
    useEffect(() => {
        const loadLocationData = async () => {
            setIsLoadingLocation(true);
            try {
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                setDistricts(districtsJson[2].data);

                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                setAllUpazilas(upazilasJson[2].data);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Failed to load location data for form.");
            } finally {
                setIsLoadingLocation(false);
            }
        };
        loadLocationData();
    }, []); // Empty dependency array: runs only once on mount

    // --- EFFECT 3: Filter upazilas when recipientDistrict changes ---
    useEffect(() => {
        if (formData.recipientDistrict && allUpazilas.length > 0 && districts.length > 0) {
            const selectedDistrictId = districts.find(d => d.name === formData.recipientDistrict)?.id;
            if (selectedDistrictId) {
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        // Reset upazila selection when district changes
        setFormData(prev => ({ ...prev, recipientUpazila: '' }));
    }, [formData.recipientDistrict, districts, allUpazilas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic client-side validation
        const {
            recipientName, recipientDistrict, recipientUpazila, recipientStreet,
            hospitalName, donationDate, donationTime, bloodGroup
        } = formData;

        if (!recipientName || !recipientDistrict || !recipientUpazila || !recipientStreet ||
            !hospitalName || !donationDate || !donationTime || !bloodGroup) {
            toast.error("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        // --- FINAL CHECK FOR USER STATUS BEFORE SUBMISSION ---
        if (!user || userStatus === 'blocked') {
            let errorMessage = "You must be logged in to submit a request.";
            if (userStatus === 'blocked') {
                errorMessage = "Your account is blocked and cannot make donation requests. Please contact support.";
            }
            toast.error(errorMessage);
            setIsSubmitting(false);
            if (!user) {
                navigate('/auth/login');
            }
            return;
        }
        // --- END FINAL CHECK ---

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const requestData = {
                ...formData,
                donationStatus: 'pending', // Default status
                donorName: 'No donor yet', // Placeholder, can be updated later
                donorEmail: 'No donor yet', // Placeholder, can be updated later
                createdAt: new Date().toISOString(), // Timestamp for the request
            };

            const response = await axiosInstance.post('/create-donation-request', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`, // Send Firebase ID token
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success("Donation request submitted successfully!");
                navigate('/dashboard/all-requests');
            } else {
                throw new Error(response.data.message || 'Failed to submit donation request.');
            }

        } catch (error) {
            console.error("Error submitting donation request:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Submission failed: ${error.response.data.message}`);
            } else {
                toast.error(`Submission failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Conditional Rendering for Loading and Blocked Status ---
    // This section ensures the correct UI is shown based on loading or user status
    if (!user) {
        // This redirect is handled by the useEffect now, but keep as fallback
        if (!isSubmitting) navigate('/auth/login');
        return null;
    }

    if (isLoadingUserStatus || isLoadingLocation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading profile and location data...</p>
            </div>
        );
    }

    if (userStatus === 'blocked') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Account Blocked</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Unfortunately, your account is currently **blocked** and you cannot make new blood donation requests.
                        Please contact support for more information.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-2">New Donation Request</h1>
                    <p className="text-lg text-gray-600">Fill out the form to request blood.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-blue-800 pt-4 border-t border-gray-200">Recipient Details</h2>

                    {/* Recipient Name & Blood Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Name</label>
                            <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Required Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    {/* Recipient Location (District, Upazila) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientDistrict" className="block text-gray-700 text-sm font-semibold mb-2">Recipient District</label>
                            <select
                                id="recipientDistrict"
                                name="recipientDistrict"
                                value={formData.recipientDistrict}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recipientUpazila" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Upazila</label>
                            <select
                                id="recipientUpazila"
                                name="recipientUpazila"
                                value={formData.recipientUpazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.recipientDistrict}
                            >
                                <option value="" disabled>Select upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.recipientDistrict && (
                                <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                            )}
                        </div>
                    </div>

                    {/* Recipient Street & Hospital Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientStreet" className="block text-gray-700 text-sm font-semibold mb-2">Recipient Street Address</label>
                            <input
                                type="text"
                                id="recipientStreet"
                                name="recipientStreet"
                                value={formData.recipientStreet}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main St"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hospitalName" className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., City General Hospital"
                                required
                            />
                        </div>
                    </div>

                    {/* Donation Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="donationDate" className="block text-gray-700 text-sm font-semibold mb-2">Donation Date</label>
                            <input
                                type="date"
                                id="donationDate"
                                name="donationDate"
                                value={formData.donationDate}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="donationTime" className="block text-gray-700 text-sm font-semibold mb-2">Donation Time</label>
                            <input
                                type="time"
                                id="donationTime"
                                name="donationTime"
                                value={formData.donationTime}
                                onChange={handleChange}
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Request Message */}
                    <div>
                        <label htmlFor="requestMessage" className="block text-gray-700 text-sm font-semibold mb-2">Request Message (Optional)</label>
                        <textarea
                            id="requestMessage"
                            name="requestMessage"
                            value={formData.requestMessage}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Add any additional details for the donor..."
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center"
                        disabled={isSubmitting} // Disable button during submission
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span> Submitting...
                            </>
                        ) : (
                            <>
                                Submit Request <FaPaperPlane className="ml-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DonationRequest;
