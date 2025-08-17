
import React, { use } from 'react';
import { FaBars, FaBed, FaHome, FaInfoCircle, FaMapMarkedAlt, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { Link, Navigate, NavLink, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logOut } = use(AuthContext);
    const firebaseUserId = user?.uid;

    const handleLogout = () => {
        logOut()
            .then(() => {
                toast.success('Logged out successfully! Come back soon!');
                Navigate('/');
            })
            .catch((error) => {
                toast.error('Error logging out. Please try again.');
                console.error('Logout Error:', error);
            });
    };

    // Optional: Function to close dropdowns after click (especially on mobile)
    const closeDropdown = () => {
        const elem = document.activeElement;
        if (elem) {
            elem.blur(); // Remove focus to close dropdown
        }
    };
    const navLinks = (
        <>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-blue-500 shadow' // Active link styling - vibrant blue
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' // Inactive link styling - blue hover
                        }`
                    }
                    to="/"
                    onClick={closeDropdown}
                >
                    <FaHome className="inline-block mr-2" /> Home
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-green-500 shadow' // Active link styling - vibrant green
                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50' // Inactive link styling - green hover
                        }`
                    }
                    // to="/browserooms"
                    onClick={closeDropdown}
                >
                    <FaBed className="inline-block mr-2" /> Browse Rooms
                </NavLink>
            </li>
            {user && (
                <li>
                    <NavLink
                        className={({ isActive }) =>
                            `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                                ? 'text-white bg-yellow-500 shadow' // Active link styling - vibrant yellow
                                : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50' // Inactive link styling - yellow hover
                            }`
                        }
                        // to={`/mybookings/${firebaseUserId}`}
                        onClick={closeDropdown}
                    >
                        <FaMapMarkedAlt className="inline-block mr-2" /> My Bookings
                    </NavLink>
                </li>
            )}
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-purple-500 shadow' // Active link styling - vibrant purple
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50' // Inactive link styling - purple hover
                        }`
                    }
                    // to="/aboutus"
                    onClick={closeDropdown}
                >
                    <FaInfoCircle className="inline-block mr-2" /> About Us
                </NavLink>
            </li>
        </>
    );
    return (
        <div>
            {/* Mobile Dropdown */}
            <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden p-0">
                    <FaBars className="h-6 w-6 text-blue-500" /> {/* Blue mobile menu icon */}
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                >
                    {navLinks}
                </ul>
            </div>

            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    <img className="w-25 mr-2" src="/resources/LifeStream.png" alt="LifeStream Logo" />
                    <img className="w-45 mr-2" src="/resources/LifeStreamTitle.png" alt="LifeStream Title" />
                    {/* <textarea className="text-5xl mt-10" name="" id="">StayDwell</textarea> */}
                </Link>
            </div>


            {/* Desktop Navigation */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    {navLinks}
                </ul>
            </div>

            {/* Navbar End - User Actions */}
            <div className="navbar-end gap-2">
                {user && (
                    <>
                        {/* Tooltip for User's Email (optional, but good UX) */}
                        <div className="tooltip tooltip-bottom hidden md:block" data-tip={user.email || 'No Email'}>
                            <button
                                onClick={() => navigate('/auth/user-profile')} // Direct navigation to profile
                                className="btn btn-ghost btn-circle avatar border border-blue-300 hover:border-blue-500" // Blue border
                            >
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            user.photoURL ||
                                            'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                                        }
                                    />
                                </div>
                            </button>
                        </div>

                        {/* Profile Dropdown for smaller screens / explicit user menu */}
                        <div className="dropdown dropdown-end lg:hidden">
                            {/* Only show on smaller screens */}
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            user.photoURL ||
                                            'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                                        }
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                            >
                                <li>
                                    <span className="text-sm font-semibold text-gray-800 p-2">
                                        {user.displayName || 'Gardener'}
                                    </span>
                                </li>
                                <li>
                                    <span className="text-xs text-gray-500 p-2 break-all">{user.email || 'No Email'}</span>
                                </li>
                                <div className="divider my-0"></div> {/* DaisyUI divider */}
                                <li>
                                    <Link to="/auth/user-profile" onClick={closeDropdown}>
                                        <FaUserCircle className="inline-block mr-2" /> Profile
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => { handleLogout(); closeDropdown(); }}>
                                        <FaSignOutAlt className="inline-block mr-2" /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}

                {/* Login/Logout Button */}
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="btn btn-error text-white font-bold transition-colors duration-200 hover:bg-red-700"
                    >
                        <FaSignOutAlt className="inline-block mr-2" /> Logout
                    </button>
                ) : (
                    <Link
                        to="/auth/login"
                        className="btn btn-success text-white font-bold transition-colors duration-200 hover:bg-green-700"
                    >
                        <FaSignInAlt className="inline-block mr-2" /> Login / Signup
                    </Link>
                )}
            </div>
        </div>
    );


};

export default Navbar;

import React, { use, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';

const Register = () => {
    const { createUser, setUser, updateUserProfile } = use(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const handleRegister = (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const photoURL = form.photoURL.value;
        const email = form.email.value;
        const password = form.password.value;

        //console.log(name, photoURL, email, password);
        createUser(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                // console.log(user);
                updateUserProfile({ displayName: name, photoURL: photoURL })
                    .then(() => {

                        setUser({ ...user, displayName: name, photoURL: photoURL });
                        toast.success("User Registered Successfully");
                        navigate("/");
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        toast.error(errorMessage);
                        setUser(user);
                        // ..
                    });
            })
            .catch((error) => {
                // const errorCode = error.code;
                // const errorMessage = error.message;
                if (error.code === "auth/email-already-in-use") {
                    toast.error("Email already in use. Please try another email.");
                } else if (error.code === "auth/invalid-email") {
                    toast.error("Invalid email format. Please check your email.");
                } else if (error.code === "auth/weak-password") {
                    toast.error(
                        "Password Needs at least 6 characters and atleast one upper and lower case letters."
                    );
                } else {
                    toast.error("Registration failed. Please try again.");
                }
            });
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col ">
                <div className="text-center">
                    <h1 className="text-3xl font-bold my-5">Register Your Account</h1>
                </div>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <form onSubmit={handleRegister} className="fieldset">
                            <label className="label font-bold">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                placeholder="Enter Your Name"
                                required
                            />
                            <label className="label font-bold">Your Photo URL</label>
                            <input
                                type="text"
                                name="photoURL"
                                className="input"
                                placeholder="Enter Your Photo URL"
                                required
                            />
                            <label className="label font-bold">Your Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="Enter Your Email"
                                required
                            />
                            <label className="label font-bold">Enter Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input input-bordered w-full pr-10"
                                    placeholder="Enter Your Password"
                                    required
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </span>
                            </div>

                            <label className="label font-bold">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input input-bordered w-full pr-10"
                                    placeholder="Enter Your Password"
                                    required
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </span>
                            </div>

                            <label className="label font-bold">Select Your Blood Group</label>
                            <select name="blood_group" id="blood_group" className="select select-bordered w-full">
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>

                            <label className="label font-bold">Your District</label>
                            <select name="blood_group" id="blood_group" className="select select-bordered w-full">
                                <option value="A+">A+</option>

                            </select>

                            <label className="label font-bold">Your Upazila</label>
                            <select name="blood_group" id="blood_group" className="select select-bordered w-full">
                                <option value="A+">A+</option>

                            </select>
                            <div>
                                <a className="link link-hover">Accept Terms & Conditions</a>
                            </div>
                            <button className="btn btn-neutral mt-4" type="submit">
                                Register
                            </button>
                            <p className="py-3 font-semibold text-center">
                                Already Have an Account ?{" "}
                                <Link className="text-secondary underline" to="/auth/login">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

import React, { use, useState } from 'react';
import { AuthContext } from '../provider/AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
//import SocialLogin from './SocialLogin';

const Login = () => {
    const [error, setError] = useState("");

    // Using the use hook to access the AuthContext
    const { signIn } = use(AuthContext);

    // Using the useLocation hook to get the current location
    // This is useful for redirecting the user back to the page they were on after logging in
    // If the user tries to access a private route, they will be redirected to the login page
    const location = useLocation();


    const navigate = useNavigate();
    let errorMessage = "Login failed. Please check your email and password.";
    console.log("Current Location: ", location);

    const handleLogin = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        // console.log(email, password);
        signIn(email, password)
            .then((userCredential) => {
                toast.success("Login Successful!");
                // Signed in
                const user = userCredential.user;
                //console.log(user);

                navigate(`${location.state ? location.state : "/"}`);


                //alert("User logged in successfully");
            })
            .catch((error) => {
                //toast.error("Login failed. Please check your email and password.!");
                // let errorMessage ="Login failed. Please check your email and password.";
                if (error.code === "auth/invalid-credential") {
                    toast.error("Incorrect login/password. Please try again.");
                }
                // } else if (error.code === "auth/wrong-password") {
                //   toast.fail("Incorrect login/password. Please try again.");
                // }
                // Swal.fire({
                //   icon: "error",
                //   title: "Login Failed",
                //   text: errorMessage,
                // });
                const errorCode = error.code;
                const errorMessage = error.message;
                // alert(errorCode, errorMessage);
                setError(errorCode);
            });
    };

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col ">
                <div className="text-center">
                    <h1 className="text-3xl font-bold my-3">Login to Your Account</h1>
                </div>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <form onSubmit={handleLogin} className="fieldset">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="Email"
                                required
                            />
                            <label className="label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="input"
                                placeholder="Password"
                                required
                            />
                            <div>
                                <a className="link link-hover">Forgot password?</a>
                            </div>
                            {error && <p className="text-red-500">{error}</p>}

                            <button className="btn btn-neutral mt-4" type="submit">
                                Login
                            </button>
                            <p className="py-3 font-semibold text-center">
                                Don't Have an Account ?{" "}
                                <Link className="text-secondary underline" to="/auth/register">
                                    Register
                                </Link>
                            </p>
                        </form>
                        {/* <SocialLogin /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane } from 'react-icons/fa';

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
                const districtsRes = await fetch('/districts.json');
                const districtsJson = await districtsRes.json();
                // Correctly access the 'data' array from the provided districts.json structure
                setDistricts(districtsJson[2].data);

                // Fetch upazilas
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
                // If no matching district ID, clear filtered upazilas
                setFilteredUpazilas([]);
            }
        } else {
            // If no district is selected, clear filtered upazilas
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
        // This function should save user data to your database (e.g., Firestore)
        // Example implementation:
        try {
            const response = await fetch(`${SERVER_ADDRESS}/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                throw new Error('Failed to save user data');
            }
            return await response.json();
        } catch (error) {
            console.error("Error saving user data:", error);
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

            await updateUserProfile({ displayName: name, photoURL: photoURL });

            // After successful registration and profile update, you might want to save
            // additional user data (blood group, location) to your database (e.g., Firestore)
            // This part is illustrative and assumes you have a database setup

            await saveUserDataToDatabase(user.uid, {
                uid: user.uid,
                name,
                email,
                photoURL,
                bloodGroup,
                district,
                upazila,
                status: 'active', // Default status
                createdAt: new Date().toISOString(),
                role: ['donor'], // Default role
            });


            setUser({ ...user, displayName: name, photoURL: photoURL });
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


import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';

const UserProfile = () => {
    const { user, updateUserProfile } = React.useContext(AuthContext);
    const [name, setName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [email, setEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.displayName || "");
            setPhotoURL(user.photoURL || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleUpdateProfile = (e) => {
        e.preventDefault();

        updateUserProfile({ displayName: name, photoURL: photoURL })
            .then(() => {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setName(user?.displayName || "");
        setPhotoURL(user?.photoURL || "");
    };
    // Or a redirect to login
    if (!user) {
        return <div>Loading user information...</div>;
    }

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col">
                <div className="text-center">
                    <h1 className="text-3xl font-bold my-5">Your Profile</h1>
                </div>
                <div className="card bg-base-100 w-full max-w-md shrink-0 shadow-2xl">
                    <div className="card-body">
                        {!isEditing ? (
                            <div>
                                <div className="mb-4">
                                    <label className="label font-bold">Name:</label>
                                    <div className="text-lg">{name}</div>
                                </div>
                                <div className="mb-4">
                                    <label className="label font-bold">Photo URL:</label>
                                    <div className="text-sm">{photoURL}</div>
                                </div>
                                <div className="mb-4">
                                    <label className="label font-bold">Email:</label>
                                    <div className="text-lg">{email}</div>
                                </div>
                                <button className="btn btn-primary" onClick={handleEditClick}>
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="fieldset">
                                <div className="form-control">
                                    <label className="label font-bold">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input input-bordered"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold">Photo URL</label>
                                    <input
                                        type="text"
                                        name="photoURL"
                                        className="input input-bordered"
                                        value={photoURL}
                                        onChange={(e) => setPhotoURL(e.target.value)}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input input-bordered"
                                        value={email}
                                        readOnly
                                        disabled
                                    />
                                    <span className="text-sm text-gray-500">
                                        Email cannot be changed.
                                    </span>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={handleCancelClick}
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-neutral" type="submit">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;



// const query = {
//   role: 'donor',
//   ...(bloodGroup && {
//     bloodGroup: { $regex: `^${bloodGroup.trim()}$`, $options: 'i' }
//   }),
//   ...(district && {
//     district: { $regex: `^${district.trim()}$`, $options: 'i' }
//   }),
//   ...(upazila && {
//     upazila: { $regex: `^${upazila.trim()}$`, $options: 'i' }
//   }),
// };

// const query = {
//   role: 'donor',
//   ...(bloodGroup && {
//     bloodGroup: { $regex: bloodGroup, $options: 'i' }
//   }),
//   ...(district && { district }), // exact match
//   ...(upazila && { upazila }),   // exact match
// };

// const query = {
//   role: 'donor',
//   ...(bloodGroup && {
//     bloodGroup: { $regex: bloodGroup, $options: 'i' }
//   }),
//   ...(district && { district }), // exact match
//   ...(upazila && { upazila }),   // exact match
// };

import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import { FaPaperPlane, FaEdit, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import axiosInstance from '../api/axiosInstance';

const UserProfile = () => {
    const SERVER_ADDRESS = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    //const { user, updateUserProfile, setUser } = useContext(AuthContext); // Added setUser to update context after profile update
    const { user, updateUserProfile, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
        email: '', // Email will be displayed but not editable
        bloodGroup: '',
        district: '',
        upazila: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    // State for location data
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // To manage loading state

    // Load initial user data and location data
    useEffect(() => {
        const loadUserDataAndLocation = async () => {
            if (user && user.uid) {
                console.log("Loading user data for UID:", user.uid); // Debugging
                try {
                    // Fetch additional user data from your backend
                    const userRes = await fetch(`${SERVER_ADDRESS}/user/${user.uid}`);
                    if (!userRes.ok) {
                        // If user data not found in DB, initialize with Firebase data
                        console.warn("User data not found in DB, initializing from Firebase Auth.");
                        setFormData({
                            name: user.displayName || '',
                            photoURL: user.photoURL || '',
                            email: user.email || '',
                            bloodGroup: '', // Default or empty
                            district: '',
                            upazila: '',
                        });
                    } else {
                        const userDataFromDB = await userRes.json();
                        setFormData({
                            name: userDataFromDB.name || user.displayName || '',
                            photoURL: userDataFromDB.photoURL || user.photoURL || '',
                            email: userDataFromDB.email || user.email || '',
                            bloodGroup: userDataFromDB.bloodGroup || '',
                            district: userDataFromDB.district || '',
                            upazila: userDataFromDB.upazila || '',
                        });
                    }

                    // Fetch districts
                    const districtsRes = await fetch('/districts.json');
                    const districtsJson = await districtsRes.json();
                    setDistricts(districtsJson[2].data);

                    // Fetch upazilas
                    const upazilasRes = await fetch('/upazilas.json');
                    const upazilasJson = await upazilasRes.json();
                    setAllUpazilas(upazilasJson[2].data);

                } catch (error) {
                    console.error("Failed to load user or location data:", error);
                    toast.error("Failed to load profile data.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                // If user object is not available (e.g., not logged in), redirect or show message
                setIsLoading(false);
                // Optionally redirect to login if user is null
                // navigate('/auth/login');
            }
        };
        loadUserDataAndLocation();
    }, [user, SERVER_ADDRESS, navigate]); // Depend on user and SERVER_ADDRESS

    // Effect to filter upazilas when district changes
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

        // Ensure photoURL is null if empty string for Firebase updateProfile
        const photoUrlToUpdate = photoURL.trim() === '' ? null : photoURL;

        try {
            // Update Firebase Auth profile
            await updateUserProfile({ displayName: name, photoURL: photoUrlToUpdate });

            // Update user context state immediately
            // setUser(prevUser => ({
            //     ...prevUser,
            //     displayName: name,
            //     photoURL: photoUrlToUpdate,
            // }));

            // Update additional user data in your backend database
            // Assuming a PUT or PATCH endpoint for updating user data by UID
            //const response = await fetch(`${SERVER_ADDRESS}/updateuser/${user.uid}`,
            const response = await axiosInstance.get(`/updateuser/${user.uid}`,
                {
                    method: 'PUT', // or 'PATCH'
                    headers: {
                        'Content-Type': 'application/json',
                        // Add authorization header if your backend requires it (e.g., JWT)
                        // 'Authorization': `Bearer ${your_jwt_token}`
                    },
                    body: JSON.stringify({
                        uid: user.uid, // Ensure UID is sent for consistency
                        name,
                        email, // Email is included but not updated via this call
                        photoURL: photoUrlToUpdate,
                        bloodGroup,
                        district,
                        upazila,

                    }),
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user data in database.');
            }

            toast.success("Profile updated successfully!");
            setIsEditing(false); // Exit editing mode
        } catch (error) {
            toast.error(`Error updating profile: ${error.message}`);
            console.error("Profile Update Error:", error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset form data to current user's data from context/initial load
        if (user) {
            setFormData({
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                email: user.email || '',
                // Reset other fields to their current values (if fetched from DB)
                bloodGroup: formData.bloodGroup, // Keep current fetched value
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

    // If user is null after loading, redirect to login
    if (!user) {
        navigate('/auth/login');
        return null; // Or a simple message
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Your Profile</h1>
                    <p className="text-lg text-gray-600">Manage your LifeStream account details.</p>
                </div>

                {!isEditing ? (
                    // View Mode
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
                    // Edit Mode
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


import React, { createContext, useEffect, useState } from 'react';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth'; // Import necessary Firebase Auth functions
import app from '../firebase/firebase.config'; // Your Firebase app configuration

// Create Firebase Auth instance
const auth = getAuth(app);
//console.log("Firebase Auth initialized:", auth); // Debugging
const googleProvider = new GoogleAuthProvider(); // For Google Sign-In

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Initialize user as null
    const [loading, setLoading] = useState(true); // Initial loading state

    // --- Firebase User Management Functions ---
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    // const updateUserProfile = (name, photo) => {
    //     console.log("Updating user profile with:", { name, photo }); // Debugging
    //     return updateProfile(auth.currentUser, {
    //         displayName: name,
    //         photoURL: photo
    //     });
    // };

    const updateUserProfile = (profileUpdates) => { // Expects a single object argument
        console.log("Updating Firebase user profile with:", profileUpdates);
        return updateProfile(auth.currentUser, profileUpdates);
    };

    const getFirebaseIdToken = async () => {
        if (auth.currentUser) {
            // getIdToken(true) forces a refresh, useful for ensuring the token is current
            // but often not necessary on every call as Firebase SDK manages refresh.
            // For security-sensitive operations, it's a good practice.
            return auth.currentUser.getIdToken(true);
        }
        return null;
    };

    // --- Core Firebase Auth State Listener with Token Handling ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in. Get the ID token.
                try {
                    // forceRefresh: true is usually NOT needed here.
                    // Firebase SDK manages token refresh automatically.
                    // Calling getIdToken() without forceRefresh will return the current valid token,
                    // or refresh it if expired, and then return the new one.
                    const idToken = await currentUser.getIdToken();
                    // console.log("Firebase ID Token in AuthProvider:", idToken); // Debugging

                    // Attach the ID token to the user object in context
                    setUser({ ...currentUser, accessToken: idToken });

                    // Optional: If you're using your custom JWTs (as discussed in server-side)
                    // This is where you would send the Firebase ID Token to your server's /jwt endpoint
                    // and store the custom JWT received back.
                    // Example:
                    /*
                    fetch(`${import.meta.env.VITE_SERVER_URL}/jwt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}` // Send Firebase ID token
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.token) {
                            localStorage.setItem('yourCustomJwtToken', data.token); // Store your custom JWT
                            // You might also want to set it in a global Axios header directly here
                            // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        }
                    })
                    .catch(error => console.error("Error getting custom JWT:", error));
                    */

                } catch (error) {
                    console.error("Error getting Firebase ID token:", error);
                    setUser(currentUser); // Still set the user, but without the token if there's an error
                }
            } else {
                // User is signed out
                //  setUser(null);
                // Optional: Clear any stored custom JWT or tokens when user logs out
                // localStorage.removeItem('yourCustomJwtToken');
                // delete axiosInstance.defaults.headers.common['Authorization'];
            }
            setLoading(false); // Set loading to false once auth state is determined
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array means this runs once on mount

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        logOut,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;


import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Assuming AuthContext is in ../provider/AuthProvider
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { useNavigate } from 'react-router'; // For navigation after submission
import { FaPaperPlane } from 'react-icons/fa'; // Icon for submit button
//import { getAuth, updateProfile } from 'firebase/auth';

const DonationRequest = () => {
    // Access user and token functions from AuthContext
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    // const auth = getAuth();
    // const currentUser = auth.currentUser;

    // if (user) {
    //     updateProfile(currentUser, {
    //         displayName: "New Display Name"
    //     }).then(() => {
    //         // Profile updated!
    //         // Now, reload the user data to get the latest display name
    //         user.reload().then(() => {
    //             console.log("Updated Display Name:", user.displayName);
    //         });
    //     }).catch((error) => {
    //         // An error occurred
    //         console.error("Error updating profile:", error);
    //     });
    // }


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
        donationStatus: 'pending', // Default status
    });

    // State for location data dropdowns
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false); // To prevent multiple submissions

    // Load user data and location data on component mount
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                uid: user.uid || '',
                requesterName: user.displayName || '',
                requesterEmail: user.email || '',
            }));
        }

        console.log("Current User:", user);
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

            const loadLocationData = async () => {
                try {
                    const districtsRes = await fetch('/districts.json');
                    const districtsJson = await districtsRes.json();
                    setDistricts(districtsJson[2].data); // Adjust index if JSON structure differs

                    const upazilasRes = await fetch('/upazilas.json');
                    const upazilasJson = await upazilasRes.json();
                    setAllUpazilas(upazilasJson[2].data); // Adjust index if JSON structure differs
                } catch (error) {
                    console.error("Failed to load location data:", error);
                    toast.error("Failed to load location data for form.");
                }
            };
            loadLocationData();
        }, [user]); // Depend on 'user' to pre-populate fields

    // Effect to filter upazilas when recipientDistrict changes
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

        if (!user) {
            toast.error("You must be logged in to submit a request.");
            setIsSubmitting(false);
            navigate('/auth/login'); // Redirect to login if user is not available
            return;
        }

        try {
            const idToken = await getFirebaseIdToken();
            if (!idToken) {
                throw new Error("Authentication token not available. Please log in again.");
            }

            const requestData = {
                ...formData,
                donationStatus: 'pending', // Default status
                createdAt: new Date().toISOString(), // Timestamp for the request
            };

            // Send data to your backend
            // Assuming your backend has a POST endpoint like /donationRequests
            const response = await axiosInstance.post('/donationRequests', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`, // Send Firebase ID token
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success("Donation request submitted successfully!");
                navigate('/dashboard/my-donation-requests'); // Navigate to a page showing user's requests
            } else {
                // Axios will typically throw for non-2xx, but this catches specific 2xx non-success codes
                throw new Error(response.data.message || 'Failed to submit donation request.');
            }

        } catch (error) {
            console.error("Error submitting donation request:", error);
            if (axiosInstance.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                toast.error(`Submission failed: ${error.response.data.message}`);
            } else {
                toast.error(`Submission failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if user is not logged in
    if (!user && !isSubmitting) { // Only redirect if not already submitting
        navigate('/auth/login');
        return null;
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


import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // Directly import your axiosInstance

export default function useRole() {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Make sure axiosInstance is properly configured and available
        // Although it's a direct import, a defensive check is good practice.
        if (axiosInstance) {
            axiosInstance("/get-user-role")
                .then((res) => {
                    // Assuming your backend returns the role directly in res.data.role
                    setRole(res.data.role);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching user role:", error);
                    setLoading(false);
                    // Set a default role or handle the error gracefully for the UI
                    setRole("donor"); // Example: set a default role if fetching fails
                });
        }
    }, []); // Empty dependency array: This effect runs only once after the initial render

    return { role, loading };
}


import React, { use } from 'react';
import { FaBars, FaBed, FaHome, FaInfoCircle, FaMapMarkedAlt, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logOut } = use(AuthContext); // Assuming use(AuthContext) is correct for your setup
    const firebaseUserId = user?.uid;

    const handleLogout = () => {
        logOut()
            .then(() => {
                toast.success('Logged out successfully! Come back soon!');
                navigate('/'); // Use navigate hook here instead of Navigate component
            })
            .catch((error) => {
                toast.error('Error logging out. Please try again.');
                console.error('Logout Error:', error);
            });
    };

    // Optional: Function to close dropdowns after click (especially on mobile)
    const closeDropdown = () => {
        const elem = document.activeElement;
        if (elem) {
            elem.blur(); // Remove focus to close dropdown
        }
    };

    const navLinks = (
        <>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-blue-500 shadow' // Active link styling - vibrant blue
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' // Inactive link styling - blue hover
                        }`
                    }
                    to="/"
                    onClick={closeDropdown}
                >
                    <FaHome className="inline-block mr-2" /> Home
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-green-500 shadow' // Active link styling - vibrant green
                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50' // Inactive link styling - green hover
                        }`
                    }
                    to="/browserooms" // Added missing 'to' prop
                    onClick={closeDropdown}
                >
                    <FaBed className="inline-block mr-2" /> Create a Request
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-green-500 shadow' // Active link styling - vibrant green
                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50' // Inactive link styling - green hover
                        }`
                    }
                    to="/browserooms" // Added missing 'to' prop
                    onClick={closeDropdown}
                >
                    <FaBed className="inline-block mr-2" /> Donete
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-green-500 shadow' // Active link styling - vibrant green
                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50' // Inactive link styling - green hover
                        }`
                    }
                    to="/browserooms" // Added missing 'to' prop
                    onClick={closeDropdown}
                >
                    <FaBed className="inline-block mr-2" /> Blog
                </NavLink>
            </li>
            {user && (
                <li>
                    <NavLink
                        className={({ isActive }) =>
                            `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                                ? 'text-white bg-yellow-500 shadow' // Active link styling - vibrant yellow
                                : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50' // Inactive link styling - yellow hover
                            }`
                        }
                        to={`/dashboard/`} // Added missing 'to' prop
                        onClick={closeDropdown}
                    >
                        <FaMapMarkedAlt className="inline-block mr-2" /> My Dashboard
                    </NavLink>
                </li>
            )}
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'text-white bg-purple-500 shadow' // Active link styling - vibrant purple
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50' // Inactive link styling - purple hover
                        }`
                    }
                    to="/aboutus" // Added missing 'to' prop
                    onClick={closeDropdown}
                >
                    <FaInfoCircle className="inline-block mr-2" /> About Us
                </NavLink>
            </li>
        </>
    );

    return (
        // Key Fix: The outermost div must have the 'navbar' class
        <div className="navbar bg-base-100">
            {/* Navbar Start Section */}
            <div className="navbar-start">
                {/* Mobile Dropdown (visible on small screens) */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden p-0">
                        <FaBars className="h-6 w-6 text-blue-500" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                    >
                        {navLinks}
                    </ul>
                </div>

                {/* Brand/Logo Section */}
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    {/* Adjusted w-25 and w-45 to valid Tailwind classes */}
                    <img className="w-24 mr-2" src="/resources/LifeStream.png" alt="LifeStream Logo" />
                    <img className="w-48 mr-2" src="/resources/LifeStreamTitle.png" alt="LifeStream Title" />
                </Link>
            </div>

            {/* Desktop Navigation (visible on large screens) */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    {navLinks}
                </ul>
            </div>

            {/* Navbar End - User Actions */}
            <div className="navbar-end gap-2">
                {user && (
                    <>
                        {/* Tooltip for User's Email (Desktop only) */}
                        <div className="tooltip tooltip-bottom hidden md:block" data-tip={user.email || 'No Email'}>
                            <button
                                onClick={() => navigate('/auth/user-profile')}
                                className="btn btn-ghost btn-circle avatar border border-blue-300 hover:border-blue-500"
                            >
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            user.photoURL ||
                                            'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                                        }
                                    />
                                </div>
                            </button>
                        </div>

                        {/* Profile Dropdown for smaller screens */}
                        <div className="dropdown dropdown-end lg:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            user.photoURL ||
                                            'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                                        }
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                            >
                                <li>
                                    <span className="text-sm font-semibold text-gray-800 p-2">
                                        {user.displayName || 'Gardener'}
                                    </span>
                                </li>
                                <li>
                                    <span className="text-xs text-gray-500 p-2 break-all">{user.email || 'No Email'}</span>
                                </li>
                                <div className="divider my-0"></div>
                                <li>
                                    <Link to="/auth/user-profile" onClick={closeDropdown}>
                                        <FaUserCircle className="inline-block mr-2" /> Profile
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => { handleLogout(); closeDropdown(); }}>
                                        <FaSignOutAlt className="inline-block mr-2" /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}

                {/* Login/Logout Button */}
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="btn btn-error text-white font-bold transition-colors duration-200 hover:bg-red-700"
                    >
                        <FaSignOutAlt className="inline-block mr-2" /> Logout
                    </button>
                ) : (
                    <Link
                        to="/auth/login"
                        className="btn btn-success text-white font-bold transition-colors duration-200 hover:bg-green-700"
                    >
                        <FaSignInAlt className="inline-block mr-2" /> Login / Signup
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa'; // Icons for submit and cancel
import axios from 'axios'; // For axios.isAxiosError

const EditDonationRequest = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams(); // Get the request ID from the URL
    const { donationRequest, error: loaderError } = useLoaderData(); // Get data from loader

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
        donationStatus: '', // Load existing status
    });

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true); // Loading state for form data

    // Handle loader errors
    useEffect(() => {
        if (loaderError) {
            toast.error(`Failed to load request for editing: ${loaderError.message}`);
            navigate('/dashboard/my-donation-requests'); // Redirect if request not found or error
        } else if (donationRequest) {
            // Populate form data with fetched request details
            setFormData({
                uid: donationRequest.uid || '',
                requesterName: donationRequest.requesterName || user?.displayName || '',
                requesterEmail: donationRequest.requesterEmail || user?.email || '',
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
    }, [donationRequest, loaderError, navigate, user]); // Depend on donationRequest, loaderError, navigate, user

    // Load static location data (districts and all upazilas)
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

    // Effect to filter upazilas when recipientDistrict changes
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
        // Only reset upazila if the district actually changed and it's not the initial load
        if (donationRequest && formData.recipientDistrict !== donationRequest.recipientDistrict) {
            setFormData(prev => ({ ...prev, recipientUpazila: '' }));
        }
    }, [formData.recipientDistrict, districts, allUpazilas, donationRequest]);


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

        if (!user || user.uid !== formData.uid) { // Ensure current user is the requester
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
                updatedAt: new Date().toISOString(), // Add an update timestamp
            };

            // Send PUT request to update the specific donation request
            const response = await axiosInstance.put(`/donationRequests/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                navigate('/dashboard/my-donation-requests'); // Go back to the list of requests
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

    if (isLoadingForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // Ensure the user is the one who made the request
    if (user && user.uid !== formData.uid) {
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
                    <p className="text-lg text-gray-600">Modify the details of your blood donation request.</p>
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

                    <h2 className="text-2xl font-bold text-red-700 pt-4 border-t border-gray-200">Recipient Details</h2>

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

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/all-requests')}
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

import React, { createContext, useEffect, useState } from 'react';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import app from '../firebase/firebase.config';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    const updateUserProfile = (profileUpdates) => {
        console.log("Updating Firebase user profile with:", profileUpdates);
        return updateProfile(auth.currentUser, profileUpdates);
    };

    const getFirebaseIdToken = async () => {
        if (auth.currentUser) {
            // getIdToken(true) forces a refresh, which is good for ensuring the token
            // is fresh before sending it to your backend for verification.
            return auth.currentUser.getIdToken(true);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const idToken = await currentUser.getIdToken();
                    setUser({ ...currentUser, accessToken: idToken });
                } catch (error) {
                    console.error("Error getting Firebase ID token during auth state change:", error);
                    setUser(currentUser);
                }
            } else {
                // FIX: Uncommented this line to correctly set user to null on logout
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        logOut,
        updateUserProfile,
        getFirebaseIdToken, // Expose the function to get Firebase ID token
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;


import { Outlet } from "react-router";
import { Link } from "react-router"; // Ensure Link is from react-router-dom
import DashboardSidebar from "../components/DashboardSidebar";
import { FaSignOutAlt } from 'react-icons/fa'; // Import the exit icon

const DashboardLayout = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-5 hidden md:flex flex-col"> {/* Added flex-col */}
                <Link to="/" className="block text-center mb-10">
                    <img
                        src="/resources/LifeStream.png"
                        alt="LifeStream Logo"
                        className="w-40 h-25 mx-auto mb-4 rounded-full object-cover "
                    />
                    <div className="text-2xl font-bold text-blue-600">
                        LifeStream
                    </div>
                </Link>

                <div className="flex-1"> {/* This div will take up remaining space, pushing the exit link down */}
                    <DashboardSidebar />
                </div>

                {/* --- Exit Portal Link at the bottom of the sidebar --- */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <Link
                        to="/" // Link to your home page or a logout route
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt size={20} /> Exit Portal
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider'; // Your authentication context
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaEdit, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'; // Added icons for new buttons
import { useNavigate } from 'react-router';

const DonorDashboardHome = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recentRequests, setRecentRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [errorFetchingRequests, setErrorFetchingRequests] = useState(false);

    useEffect(() => {
        const fetchRecentDonationRequests = async () => {
            if (!user || !user.uid) {
                setLoadingRequests(false);
                return;
            }

            setLoadingRequests(true);
            setErrorFetchingRequests(false);

            try {
                const idToken = await getFirebaseIdToken();
                if (!idToken) {
                    throw new Error("Authentication token not available. Please log in again.");
                }

                const response = await axiosInstance.get(`/donationRequests/recent/${user.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                setRecentRequests(response.data);
            } catch (error) {
                console.error("Error fetching recent donation requests:", error);
                toast.error("Failed to load recent donation requests.");
                setErrorFetchingRequests(true);
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchRecentDonationRequests();
    }, [user, getFirebaseIdToken]);

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'N/A';
        try {
            const dateTimeString = `${date}T${time}:00`;
            const options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            };
            return new Date(dateTimeString).toLocaleString(undefined, options);
        } catch (e) {
            console.error("Error formatting date/time:", e);
            return `${date} at ${time}`;
        }
    };

    const handleEditRequest = (requestId) => {
        // Implement navigation to an edit form
        navigate(`/dashboard/edit-request/${requestId}`);
    };

    const handleCancelRequest = async (requestId) => {
        if (window.confirm("Are you sure you want to cancel this donation request? This action cannot be undone.")) {
            // Implement API call to delete the request on your backend
            console.log(`Canceling request with ID: ${requestId}`);
            try {
                const idToken = await getFirebaseIdToken();
                await axiosInstance.delete(`/donationRequests/${requestId}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });
                toast.success('Donation request canceled successfully!');
                // Re-fetch requests to update the UI
                setRecentRequests(prev => prev.filter(req => req._id !== requestId));
            } catch (error) {
                console.error('Failed to cancel request:', error);
                toast.error('Failed to cancel the request. Please try again.');
            }
        }
    };

    const handleCompleteRequest = async (requestId) => {
        // Implement API call to update the request status to 'completed'
        console.log(`Completing request with ID: ${requestId}`);
        try {
            const idToken = await getFirebaseIdToken();
            await axiosInstance.put(`/donationRequests/complete/${requestId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            toast.success('Donation marked as completed!');
            // Re-fetch requests to update the UI
            setRecentRequests(prev => prev.map(req =>
                req._id === requestId ? { ...req, donationStatus: 'completed' } : req
            ));
        } catch (error) {
            console.error('Failed to complete request:', error);
            toast.error('Failed to mark as completed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
                        Welcome, {user?.displayName || 'LifeStream Donor'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for being a vital part of our community. Your generosity saves lives!
                    </p>
                </div>

                <h2 className="text-3xl font-bold text-red-700 mb-6 text-center border-t pt-6 border-gray-200">
                    Your Recent Donation Requests
                </h2>

                {loadingRequests ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Loading your requests...</p>
                    </div>
                ) : errorFetchingRequests ? (
                    <div className="text-center text-red-500 text-lg py-10">
                        <p>Could not load your recent requests. Please try again later.</p>
                    </div>
                ) : recentRequests.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg py-10">
                        <p>You haven't made any donation requests yet. Start by creating one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentRequests.map((request) => (
                            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                                <div className="flex-grow">
                                    <div className="flex items-center mb-3">
                                        <FaTint className="text-red-500 text-2xl mr-3" />
                                        <h3 className="text-xl font-bold text-gray-800">{request.bloodGroup} for {request.recipientName}</h3>
                                    </div>
                                    <p className="text-gray-700 mb-2 flex items-center">
                                        <FaHospital className="text-blue-500 mr-2" /> {request.hospitalName}
                                    </p>
                                    <p className="text-gray-700 mb-2 flex items-center">
                                        <FaMapMarkerAlt className="text-green-500 mr-2" /> {request.recipientStreet}, {request.recipientUpazila}, {request.recipientDistrict}
                                    </p>
                                    <p className="text-gray-700 mb-2 flex items-center">
                                        <FaCalendarAlt className="text-purple-500 mr-2" /> {formatDateTime(request.donationDate, request.donationTime)}
                                    </p>
                                    <p className="text-gray-700 text-sm italic mt-3">
                                        Status: <span className={`font-semibold ${request.donationStatus === 'pending' ? 'text-orange-500' : request.donationStatus === 'inProgress' ? 'text-blue-500' : 'text-green-600'}`}>
                                            {request.donationStatus.charAt(0).toUpperCase() + request.donationStatus.slice(1)}
                                        </span>
                                    </p>
                                    {request.requestMessage && (
                                        <p className="text-gray-600 text-sm mt-2 border-t border-gray-100 pt-2">
                                            "{request.requestMessage}"
                                        </p>
                                    )}
                                </div>

                                {/* Dynamic buttons based on status */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                    {request.donationStatus === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleEditRequest(request._id)}
                                                className="flex items-center btn-sm bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 transition-colors"
                                            >
                                                <FaEdit className="mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleCancelRequest(request._id)}
                                                className="flex items-center btn-sm bg-red-500 text-white rounded-md px-3 py-1 text-sm hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimesCircle className="mr-1" /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {request.donationStatus === 'InProgress' && (
                                        <>
                                            <button
                                                onClick={() => handleCompleteRequest(request._id)}
                                                className="flex items-center btn-sm bg-green-500 text-white rounded-md px-3 py-1 text-sm hover:bg-green-600 transition-colors"
                                            >
                                                <FaCheckCircle className="mr-1" /> Complete
                                            </button>
                                            <button
                                                onClick={() => handleCancelRequest(request._id)}
                                                className="flex items-center btn-sm bg-red-500 text-white rounded-md px-3 py-1 text-sm hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimesCircle className="mr-1" /> Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/dashboard/all-requests')}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105"
                    >
                        View All My Requests
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboardHome;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../provider/AuthProvider';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const EditDonationRequest = () => {
    // Access userRole from context
    const { user, userRole, getFirebaseIdToken } = useContext(AuthContext);
    console.log("User Role in EditDonationRequest:", userRole);
    const navigate = useNavigate();
    const { id } = useParams();
    const { donationRequest, error: loaderError } = useLoaderData();
    console.log("Donation Request Data:", donationRequest);

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
    }, [donationRequest, loaderError, navigate, user]);

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
        if (donationRequest && formData.recipientDistrict !== donationRequest.recipientDistrict) {
            setFormData(prev => ({ ...prev, recipientUpazila: '' }));
        }
    }, [formData.recipientDistrict, districts, allUpazilas, donationRequest]);

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

        // Authorization check to use userRole string
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

            // Allow admins and volunteers to change status, but volunteers have a limited set of options.
            // if (userRole === 'volunteer' && updatedRequestData.donationStatus === 'completed') {
            //     toast.error("Volunteers cannot mark requests as 'completed'.");
            //     setIsSubmitting(false);
            //     return;
            // }

            const response = await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.status === 200) {
                toast.success("Donation request updated successfully!");
                // CHANGE: Redirect based on user's role
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

    if (isLoadingForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    // CHANGE: Authorization check for rendering the form
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
                            onClick={() => navigate('/dashboard/all-requests')}
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



