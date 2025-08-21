import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const EditDonationRequest = () => {
    const { user, userRole, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { donationRequest, error: loaderError } = useLoaderData();

    const [formData, setFormData] = useState({
        uid: '',
        requesterName: '',
        requesterEmail: '',
        recipientName: '',
        recipientDistrict: '',
        recipientUpazila: '',
        recipientStreet: '',
        hospitalName: '',
        requestMessage: '',
        donationDate: '',
        donationTime: '',
        bloodGroup: '',
        donationStatus: '',
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    // Effect to fetch location data
    useEffect(() => {
        const loadLocationData = async () => {
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
            }
        };
        loadLocationData();
    }, []);

    // Effect to populate form data and filter upazilas on initial load
    useEffect(() => {
        if (loaderError) {
            toast.error(`Failed to load request for editing: ${loaderError.message}`);
            navigate('/dashboard');
        } else if (donationRequest) {
            setFormData({
                uid: donationRequest.uid || '',
                requesterName: donationRequest.requesterName || '',
                requesterEmail: donationRequest.requesterEmail || '',
                recipientName: donationRequest.recipientName || '',
                recipientDistrict: donationRequest.recipientDistrict || '',
                recipientUpazila: donationRequest.recipientUpazila || '',
                recipientStreet: donationRequest.recipientStreet || '',
                hospitalName: donationRequest.hospitalName || '',
                requestMessage: donationRequest.requestMessage || '',
                donationDate: donationRequest.donationDate || '',
                donationTime: donationRequest.donationTime || '',
                bloodGroup: donationRequest.bloodGroup || '',
                donationStatus: donationRequest.donationStatus || 'pending',
            });
            setIsLoadingForm(false);
        }
    }, [donationRequest, loaderError, navigate]);

    // A separate effect to filter upazilas based on the district and available data
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
        // This line is now removed as it was part of the original issue
        // We only clear the upazila if the district changes
        if (donationRequest && formData.recipientDistrict !== donationRequest.recipientDistrict) {
            setFormData(prev => ({ ...prev, recipientUpazila: '' }));
        }
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

        const canEdit = userRole === 'admin' || user?.uid === formData.uid;
        if (!user || !canEdit) {
            toast.error("Unauthorized to edit this request.");
            setIsSubmitting(false);
            navigate('/auth/login');
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const updatedRequestData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };

            const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                if (userRole === 'admin' || userRole === 'volunteer') {
                    navigate('/dashboard/all-donation-requests');
                } else {
                    navigate('/dashboard/my-donation-requests');
                }
            } else {
                throw new Error(response.data.message || 'Failed to update donation request.');
            }

        } catch (error) {
            console.error("Error updating donation request:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Update failed: ${error.response.data.message}`);
            } else {
                toast.error(`Update failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle the cancel action with role-based navigation
    const handleCancel = () => {
        if (userRole === 'admin' || userRole === 'volunteer') {
            navigate('/dashboard/all-donation-requests');
        } else {
            navigate('/dashboard/my-donation-requests');
        }
    };

    if (isLoadingForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    const canRender = userRole === 'admin' || userRole === 'volunteer' || user?.uid === formData.uid;
    if (!canRender) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-300">
                    <h1 className="text-4xl font-extrabold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        You do not have permission to edit this donation request.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/my-donation-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        Go to My Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Edit Donation Request</h1>
                    {(userRole === 'admin' || userRole === 'volunteer') && donationRequest && (
                        <p className="text-md text-red-600 font-medium mt-2">
                            {userRole === 'admin' ? "Admin Mode:" : "Volunteer Mode:"} Editing request for **{donationRequest.requesterName}**
                        </p>
                    )}
                    <p className="text-lg text-gray-600">Modify the details of this blood donation request.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Requester Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                                value={formData.requesterEmail}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {/* Admin and Volunteer: Status dropdown */}
                    {(userRole === 'admin' || userRole === 'volunteer') && (
                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="donationStatus" className="block text-gray-700 text-sm font-semibold mb-2">Donation Status ({userRole === 'admin' ? 'Admin Only' : 'Volunteer and Admin'})</label>
                            <select
                                id="donationStatus"
                                name="donationStatus"
                                value={formData.donationStatus}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                {/* Only admins can mark as completed */}
                                {userRole === 'admin' && <option value="completed">Completed</option>}
                            </select>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

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

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDonationRequest;
