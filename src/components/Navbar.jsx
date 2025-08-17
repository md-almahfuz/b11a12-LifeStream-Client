import React, { useState, use } from 'react';
import { FaBars, FaHome, FaInfoCircle, FaSignInAlt, FaSignOutAlt, FaUserCircle, FaHandHoldingHeart, FaPlusCircle, FaBookOpen, FaMapMarkedAlt } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router';
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
                navigate('/');
            })
            .catch((error) => {
                toast.error('Error logging out. Please try again.');
                console.error('Logout Error:', error);
            });
    };

    const closeDropdown = () => {
        const elem = document.activeElement;
        if (elem) {
            elem.blur();
        }
    };

    const navLinks = (
        <>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                        }`
                    }
                    to="/create-request"
                    onClick={closeDropdown}
                >
                    {/* Updated icon for Create a Request */}
                    <FaPlusCircle className="inline-block mr-2" /> Create a Request
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                        }`
                    }
                    to="/auth/donate"
                    onClick={closeDropdown}
                >
                    {/* Updated icon for Donate */}
                    <FaHandHoldingHeart className="inline-block mr-2" /> Donate
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`
                    }
                    to="/blogs"
                    onClick={closeDropdown}
                >
                    {/* Updated icon for Blog */}
                    <FaBookOpen className="inline-block mr-2" /> Blog
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive }) =>
                        `text-lg font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                        }`
                    }
                    to="/aboutus"
                    onClick={closeDropdown}
                >
                    <FaInfoCircle className="inline-block mr-2" /> About Us
                </NavLink>
            </li>
        </>
    );

    return (
        <div className="navbar bg-white bg-opacity-80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-md border-b border-gray-200">
            {/* Navbar Start Section */}
            <div className="navbar-start flex-grow-0">
                {/* Mobile Dropdown (visible on small screens) */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden p-0">
                        <FaBars className="h-6 w-6 text-red-600" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-white rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                    >
                        {navLinks}
                    </ul>
                </div>

                {/* Brand/Logo Section - restored original image assets */}
                <Link to="/" className="btn btn-ghost text-xl font-bold p-0">
                    <img className="w-24 mr-2" src="/resources/LifeStream.png" alt="LifeStream Logo" />
                    <img className="w-48 mr-2 hidden md:block" src="/resources/LifeStreamTitle.png" alt="LifeStream Title" />
                </Link>
            </div>

            {/* Desktop Navigation (visible on large screens) */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    {navLinks}
                </ul>
            </div>

            {/* Navbar End - User Actions */}
            <div className="navbar-end gap-2 flex-grow-0">
                {user ? (
                    <>
                        {/* User Avatar and Dropdown Menu */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border-2 border-red-500 hover:border-red-700 transition-colors duration-200">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            user.photoURL ||
                                            `https://placehold.co/150x150/FF0000/FFFFFF?text=${user.email ? user.email.charAt(0).toUpperCase() : 'U'}`
                                        }
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-white rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-gray-200"
                            >
                                <li>
                                    <span className="text-sm font-bold text-gray-800 p-2">
                                        {user.displayName || 'Donor'}
                                    </span>
                                </li>
                                <li>
                                    <span className="text-xs text-gray-500 p-2 break-all">{user.email || 'No Email'}</span>
                                </li>
                                <div className="divider my-0"></div>
                                <li>
                                    <Link to="/auth/user-profile" onClick={closeDropdown} className="justify-between">
                                        <FaUserCircle className="inline-block mr-2" /> Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`/dashboard/`} onClick={closeDropdown} className="justify-between">
                                        <FaMapMarkedAlt className="inline-block mr-2" /> Dashboard
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
                ) : (
                    <Link
                        to="/auth/login"
                        className="btn btn-primary bg-red-600 text-white font-bold transition-colors duration-200 hover:bg-red-700 shadow-lg"
                    >
                        <FaSignInAlt className="inline-block mr-2" /> Login / Signup
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;
