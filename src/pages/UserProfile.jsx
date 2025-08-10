import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane, FaEdit, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import axiosInstance from '../api/axiosInstance'; // axios instance

const UserProfile = () => {
    // The SERVER_ADDRESS is typically configured in axiosInstance's baseUrl
    // const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { user, updateUserProfile, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '',
        bloodGroup: '',
        district: '',
        upazila: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Debugging axiosInstance configuration
    useEffect(() => {
        console.log("Axios Instance Base URL:", axiosInstance.defaults.baseURL);
        // If axiosInstance doesn't have a baseURL, you might need to prepend SERVER_ADDRESS
        // or configure axiosInstance in '../api/axiosInstance.js' with the VITE_SERVER_URL
    }, []);


    useEffect(() => {
        const loadUserDataAndLocation = async () => {
            if (user && user.uid) {
                console.log("Loading user data for UID:", user.uid);
                try {
                    // Use axiosInstance for fetching user data
                    const userRes = await axiosInstance.get(`/user/${user.uid}`);

                    // Axios automatically checks for 2xx status codes and throws for others
                    const userDataFromDB = userRes.data; // Axios response data is in .data
                    setFormData({
                        name: userDataFromDB.name || user.displayName || '',
                        photoURL: userDataFromDB.photoURL || user.photoURL || '',
                        email: userDataFromDB.email || user.email || '',
                        bloodGroup: userDataFromDB.bloodGroup || '',
                        district: userDataFromDB.district || '',
                        upazila: userDataFromDB.upazila || '',
                    });

                    const districtsRes = await fetch('/districts.json');
                    const districtsJson = await districtsRes.json();
                    setDistricts(districtsJson[2].data);

                    const upazilasRes = await fetch('/upazilas.json');
                    const upazilasJson = await upazilasRes.json();
                    setAllUpazilas(upazilasJson[2].data);

                } catch (error) {
                    console.error("Failed to load user or location data:", error);
                    // Handle 404 specifically if user data is not found in DB
                    if (axios.isAxiosError(error) && error.response && error.response.status === 404) { // Use axios.isAxiosError
                        console.warn("User data not found in DB, initializing from Firebase Auth.");
                        setFormData({
                            name: user.displayName || '',
                            photoURL: user.photoURL || '',
                            email: user.email || '',
                            bloodGroup: '',
                            district: '',
                            upazila: '',
                        });
                    } else {
                        toast.error("Failed to load profile data.");
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                navigate('/auth/login');
            }
        };
        loadUserDataAndLocation();
    }, [user, navigate]); // Removed SERVER_ADDRESS from dependencies as it's handled by axiosInstance

    useEffect(() => {
        if (formData.district && allUpazilas.length > 0 && districts.length > 0) {
            const selectedDistrictId = districts.find(d => d.name === formData.district)?.id;
            if (selectedDistrictId) {
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
    }, [formData.district, districts, allUpazilas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const { name, photoURL, email, bloodGroup, district, upazila } = formData;
        const photoUrlToUpdate = photoURL.trim() === '' ? null : photoURL;

        try {
            await updateUserProfile({ displayName: name, photoURL: photoUrlToUpdate });

            const idToken = await getFirebaseIdToken();
            console.log("Frontend: idToken obtained:", idToken);
            if (!idToken) {
                console.error("Frontend: idToken is null or empty. Throwing error.");
                throw new Error("Failed to get authentication token.");
            }

            const response = await axiosInstance.put(
                `/updateuser/${user.uid}`, // URL
                { // Data payload
                    uid: user.uid,
                    name,
                    email,
                    photoURL: photoUrlToUpdate,
                    bloodGroup,
                    district,
                    upazila,
                },
                { // Configuration object (headers, etc.)
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`, // Send Firebase ID token
                    },
                }
            );

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Profile Update Error:", error);
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Error updating profile: ${error.response.data.message}`);
            } else {
                toast.error(`Error updating profile: ${error.message}`);
            }
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                email: user.email || '',
                bloodGroup: formData.bloodGroup,
                district: formData.district,
                upazila: formData.upazila,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading user profile...</p>
            </div>
        );
    }

    if (!user) {
        navigate('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Your Profile</h1>
                    <p className="text-lg text-gray-600">Manage your LifeStream account details.</p>
                </div>

                {!isEditing ? (
                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="avatar">
                                <div className="w-24 h-24 rounded-full ring ring-blue-500 ring-offset-base-100 ring-offset-2">
                                    <img src={formData.photoURL || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'} alt="User Avatar" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Name:</label>
                            <p className="text-lg font-medium">{formData.name || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Email:</label>
                            <p className="text-lg font-medium">{formData.email || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Blood Group:</label>
                            <p className="text-lg font-medium">{formData.bloodGroup || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">District:</label>
                            <p className="text-lg font-medium">{formData.district || 'N/A'}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Upazila:</label>
                            <p className="text-lg font-medium">{formData.upazila || 'N/A'}</p>
                        </div>

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center mt-6"
                            onClick={handleEditClick}
                        >
                            Edit Profile <FaEdit className="ml-2" />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {/* Photo URL */}
                        <div>
                            <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                            <input
                                type="url"
                                id="photoURL"
                                name="photoURL"
                                className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.photoURL}
                                onChange={handleChange}
                                placeholder="https://example.com/your-photo.jpg"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input input-bordered w-full px-4 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                                value={formData.email}
                                readOnly
                                disabled
                            />
                            <p className="text-sm text-gray-500 mt-1">Email cannot be changed.</p>
                        </div>

                        {/* Blood Group */}
                        <div>
                            <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Select Your Blood Group</label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select a blood group</option>
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

                        {/* District */}
                        <div>
                            <label htmlFor="district" className="block text-gray-700 text-sm font-semibold mb-2">Your District</label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" disabled>Select a district</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Upazila */}
                        <div>
                            <label htmlFor="upazila" className="block text-gray-700 text-sm font-semibold mb-2">Your Upazila</label>
                            <select
                                id="upazila"
                                name="upazila"
                                value={formData.upazila}
                                onChange={handleChange}
                                className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!formData.district}
                            >
                                <option value="" disabled>Select an upazila</option>
                                {filteredUpazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {!formData.district && (
                                <p className="text-sm text-gray-500 mt-1">Please select a district first to see upazilas.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center"
                                onClick={handleCancelClick}
                            >
                                <FaTimesCircle className="mr-2" /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors duration-200 flex items-center"
                            >
                                Save Changes <FaPaperPlane className="ml-2" />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
