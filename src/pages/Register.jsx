import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
    const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { createUser, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '',
        password: '',
        confirmPassword: '',
        bloodGroup: '',
        district: '',
        upazila: '',
    });

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for location data
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // State for terms and conditions
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [termsError, setTermsError] = useState('');

    // State for file upload
    const [photoFile, setPhotoFile] = useState(null);

    // Load districts and upazilas from JSON files on component mount
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                // Fetch districts
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                setDistricts(districtsJson[2].data);

                // Fetch upazilas
                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                setAllUpazilas(upazilasJson[2].data);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Failed to load location data.");
            }
        };
        loadLocationData();
    }, []);

    // Effect to filter upazilas when district changes
    useEffect(() => {
        if (formData.district) {
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
        setFormData(prev => ({ ...prev, upazila: '' }));
    }, [formData.district, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data?.data?.url;
    };

    const saveUserDataToDatabase = async (userId, userData) => {
        try {
            console.log("Attempting to save user data to DB:", userData);
            const response = await axios.post(`${SERVER_ADDRESS}/Users`, userData);
            console.log("DB save response status:", response.status);
            console.log("DB save response data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error saving user data:", error);
            if (axios.isAxiosError(error) && error.response) {
                // Log the server error response if available
                console.error("Server responded with:", error.response.status, error.response.data);
                throw new Error(error.response.data.message || error.message);
            }
            throw error;
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, photoURL, email, password, confirmPassword, bloodGroup, district, upazila } = formData;

        // Client-side validation
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            toast.error("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[a-z]/.test(password)) {
            toast.error("Password must contain at least one lowercase letter.");
            return;
        }
        if (!acceptTerms) {
            setTermsError("You must accept the Terms & Conditions.");
            return;
        } else {
            setTermsError('');
        }

        try {
            // Step 1: Create a new user in Firebase Authentication
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // Step 2: Clean up the photoURL and set it on the Firebase user profile
            // Upload to ImgBB if file selected
            let uploadedPhotoURL = "";

            if (photoFile) {
                uploadedPhotoURL = await uploadToImgBB(photoFile);
            }
            const updatedPhotoURL = photoURL.trim() === '' ? null : photoURL;
            await updateUserProfile({ displayName: name, photoURL: updatedPhotoURL });
            console.log("User profile updated:", { displayName: name, photoURL: updatedPhotoURL });

            // Step 3: Save user data to your own backend database
            await saveUserDataToDatabase(user.uid, {
                uid: user.uid,
                name,
                email,
                photoURL: uploadedPhotoURL,
                bloodGroup,
                district,
                upazila,
                status: 'active',
                createdAt: new Date().toISOString(),
                role: 'donor',
            });

            // The AuthContext's onAuthStateChanged listener will automatically update the user state.
            // No need to call setUser directly.

            toast.success("Registration successful! Welcome to LifeStream.");
            navigate("/");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already in use. Please try another email.");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format. Please check your email.");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password is too weak. Please use a stronger password.");
            } else {
                toast.error(`Registration failed: ${error.message}`);
                console.error("Registration Error:", error);
            }
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Join LifeStream</h1>
                    <p className="text-lg text-gray-600">Register to become a life-saver today!</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    {/* Photo URL */}
                    {/* <div>
                        <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                        <input
                            type="url"
                            id="photoURL"
                            name="photoURL"
                            value={formData.photoURL}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/your-photo.jpg"
                        />
                    </div> */}
                    {/* Profile Picture */}
                    <div>
                        <label htmlFor="photoFile" className="block text-gray-700 text-sm font-semibold mb-2">
                            Profile Picture (Optional)
                        </label>
                        <input
                            type="file"
                            id="photoFile"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                        />
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min. 6 characters, uppercase, lowercase"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
                    </div>
                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter your password"
                                required
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-blue-600"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? (
                                    <AiOutlineEyeInvisible size={20} />
                                ) : (
                                    <AiOutlineEye size={20} />
                                )}
                            </span>
                        </div>
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
                    {/* Terms & Conditions Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => {
                                setAcceptTerms(e.target.checked);
                                if (e.target.checked) setTermsError('');
                            }}
                            className="checkbox checkbox-primary mr-2"
                        />
                        <label htmlFor="acceptTerms" className="text-gray-700 text-sm">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
                        </label>
                    </div>
                    {termsError && <p className="text-red-500 text-sm -mt-3">{termsError}</p>}
                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center"
                    >
                        Register <FaPaperPlane className="ml-2" />
                    </button>
                    {/* Login Link */}
                    <p className="py-3 font-semibold text-center text-gray-700">
                        Already Have an Account?{" "}
                        <Link className="text-blue-600 hover:underline" to="/auth/login">
                            Login Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
export default Register;
