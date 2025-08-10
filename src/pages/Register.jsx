import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane } from 'react-icons/fa'; // Added FaPaperPlane import

const Register = () => {
    const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const { createUser, setUser, updateUserProfile } = useContext(AuthContext);
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

    // Load districts and upazilas from JSON files on component mount
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                // Fetch districts
                // Ensure the path is correct: /data/districts.json if in public/data
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                // Correctly access the 'data' array from the provided districts.json structure
                setDistricts(districtsJson[2].data);

                // Fetch upazilas
                // Ensure the path is correct: /data/upazilas.json if in public/data
                const upazilasRes = await fetch('/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                // Correctly access the 'data' array from the provided upazilas.json structure
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
            // Find the district ID based on the selected district name
            const selectedDistrictId = districts.find(d => d.name === formData.district)?.id;
            if (selectedDistrictId) {
                // Filter all upazilas by the selected district ID
                const filtered = allUpazilas.filter(upazila => upazila.district_id === selectedDistrictId);
                setFilteredUpazilas(filtered);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        // Reset upazila selection when district changes
        setFormData(prev => ({ ...prev, upazila: '' }));
    }, [formData.district, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const saveUserDataToDatabase = async (userId, userData) => {
        try {
            console.log("Attempting to save user data to DB:", userData); // Log data being sent
            const response = await fetch(`${SERVER_ADDRESS}/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Log the full response for debugging
            const responseData = await response.json(); // Try to parse response even if not ok
            console.log("DB save response status:", response.status);
            console.log("DB save response data:", responseData);

            if (!response.ok) {
                // Throw an error with more details from the server response
                throw new Error(`Failed to save user data: ${responseData.message || response.statusText}`);
            }
            return responseData;
        } catch (error) {
            console.error("Error saving user data:", error);
            // Re-throw to be caught by handleRegister's catch block
            throw error;
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, photoURL, email, password, confirmPassword, bloodGroup, district, upazila } = formData;

        console.log("Form Data on Register:", formData); // Log form data for debugging
        console.log("Email:", email); // Log email for debugging
        console.log("Photo URL:", photoURL); // Log photo URL for debugging

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
        // Add more complex password validation if needed (numbers, special chars)
        // if (!/\d/.test(password)) { toast.error("Password must contain at least one digit."); return; }
        // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { toast.error("Password must contain at least one special character."); return; }

        if (!acceptTerms) {
            setTermsError("You must accept the Terms & Conditions.");
            return;
        } else {
            setTermsError('');
        }

        try {
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // FIX: Ensure photoURL is null if empty string for updateUserProfile
            const UpdateedPhotoURL = photoURL.trim() === '' ? null : photoURL;

            await updateUserProfile(name, UpdateedPhotoURL);

            console.log("User profile updated:", { displayName: name, photoURL: UpdateedPhotoURL });

            // IMPORTANT: Include uid in the data object
            await saveUserDataToDatabase(user.uid, {
                uid: user.uid, // Explicitly adding uid to the data object
                name,
                email,
                photoURL: UpdateedPhotoURL,
                bloodGroup,
                district,
                upazila,
                status: 'active', // Default status
                createdAt: new Date().toISOString(),
                role: 'donor',
            });


            //  setUser({ ...user, displayName: name, photoURL: UpdateedPhotoURL }); // Update context user with cleaned photoURL
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
                // Display the error message from saveUserDataToDatabase if it's the source of the error
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
                    <div>
                        <label htmlFor="photoURL" className="block text-gray-700 text-sm font-semibold mb-2">Photo URL (Optional)</label>
                        <input
                            type="url" // Changed to url type for better input validation
                            id="photoURL"
                            name="photoURL"
                            value={formData.photoURL}
                            onChange={handleChange}
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/your-photo.jpg"
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
                            disabled={!formData.district} // Disable if no district is selected
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
                                if (e.target.checked) setTermsError(''); // Clear error if checked
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
