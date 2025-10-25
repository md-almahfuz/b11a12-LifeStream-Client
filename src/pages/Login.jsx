import React, { useState, useContext } from 'react'; // Changed 'use' to 'useContext'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // For password visibility toggle
import { AuthContext } from '../provider/AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { FaSignInAlt } from 'react-icons/fa';
//import SocialLogin from './SocialLogin'; // Keep commented if not in use

const Login = () => {
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const { signIn } = useContext(AuthContext); // Use useContext
    const location = useLocation();
    const navigate = useNavigate();

    // console.log("Current Location: ", location); // Keep for debugging if needed

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            await signIn(email, password);
            toast.success("Login Successful! Welcome back to LifeStream.");

            // Redirect user to the page they were trying to access, or to home page
            navigate(location.state?.from || "/");

        } catch (error) {
            // More specific and user-friendly error messages
            if (error.code === "auth/invalid-credential") {
                toast.error("Incorrect email or password. Please try again.");
            } else if (error.code === "auth/user-not-found") { // Though often covered by invalid-credential
                toast.error("No account found with this email. Please register.");
            } else if (error.code === "auth/wrong-password") { // Though often covered by invalid-credential
                toast.error("Incorrect password. Please try again.");
            } else if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format. Please check your email.");
            }
            else {
                toast.error(`Login failed: ${error.message}`);
                console.error("Login Error:", error); // Log full error for debugging
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Welcome To LifeStream</h1>
                    <p className="text-lg text-gray-600">Login to your LifeStream account.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input input-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {/* Password Input with Toggle */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="input input-bordered w-full pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
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

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <a href="#" className="text-blue-600 hover:underline text-sm font-semibold">Forgot password?</a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center"
                    >
                        Login <FaSignInAlt className="ml-2" />
                    </button>

                    {/* Register Link */}
                    <p className="py-3 font-semibold text-center text-gray-700">
                        Don't Have an Account?{" "}
                        <Link className="text-blue-600 hover:underline" to="/auth/register">
                            Register Here
                        </Link>
                    </p>
                </form>
                <SocialLogin />
            </div>
        </div>
    );
};

export default Login;
