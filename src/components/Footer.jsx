import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaHeartbeat } from 'react-icons/fa'; // Added FaHeartbeat
import { Link } from 'react-router'; // Changed from 'react-router' to 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-red-700 to-blue-800 text-white py-12 shadow-lg"> {/* Changed gradient colors for theme */}
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Company Info */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <img
                        className="w-24 h-24 object-contain rounded-full mb-4 shadow-md border-2 border-white"
                        src="/resources/LifeStream.png" // Updated logo path
                        alt="LifeStream Logo"
                    />
                    <h3 className="text-3xl font-bold mb-3 tracking-wide flex items-center">
                        <FaHeartbeat className="mr-2 text-red-300" /> LifeStream {/* Added heartbeat icon */}
                    </h3>
                    <p className="text-sm text-red-100 mb-3 leading-relaxed"> {/* Changed text color */}
                        Your lifeline for blood donation. Connecting donors with recipients to save lives, one drop at a time.
                    </p>
                    <p className="text-xs text-red-200"> {/* Changed text color */}
                        &copy; {new Date().getFullYear()} LifeStream. All rights reserved.
                    </p>
                </div>

                {/* Navigation */}
                <div className="text-center md:text-left mt-8 md:mt-0">
                    <h3 className="text-xl font-semibold mb-5 border-b-2 border-red-400 pb-2 inline-block">Explore</h3> {/* Styled heading */}
                    <ul className="text-base text-red-100 space-y-3"> {/* Changed text color */}
                        <li>
                            <Link
                                to="/"
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/dashboard/my-donation-requests" // Changed to match "My Requests" for donors
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                My Requests
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/dashboard/my-donations" // Assuming a "My Donations" page exists
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                My Donations
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/aboutus" // Changed to match your /aboutus route
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                About Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Helpful Links */}
                <div className="text-center md:text-left mt-8 md:mt-0">
                    <h3 className="text-xl font-semibold mb-5 border-b-2 border-red-400 pb-2 inline-block">Helpful Links</h3> {/* Styled heading */}
                    <ul className="text-base text-red-100 space-y-3"> {/* Changed text color */}
                        <li>
                            <Link
                                to="/faq" // Assuming you have an FAQ page
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                FAQ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/privacy-policy" // Assuming a privacy policy page
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/terms-of-service" // Assuming a terms of service page
                                className="hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105 inline-block"
                            >
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Connect With Us / Contact */}
                <div className="text-center md:text-left mt-8 md:mt-0">
                    <h3 className="text-xl font-semibold mb-5 border-b-2 border-red-400 pb-2 inline-block">Contact & Connect</h3> {/* Styled heading */}
                    <div className="space-y-4 mb-6">
                        <p className="text-red-100 text-base flex items-center justify-center md:justify-start"> {/* Changed text color */}
                            <FaEnvelope className="mr-3 text-yellow-300" size={20} />
                            <a href="mailto:info@lifestream.com" className="hover:text-yellow-300 transition-colors duration-300">info@lifestream.com</a>
                        </p>
                        <p className="text-red-100 text-base flex items-center justify-center md:justify-start"> {/* Changed text color */}
                            <FaPhone className="mr-3 text-yellow-300" size={20} />
                            {/* Updated phone number for Dhaka, Bangladesh */}
                            <a href="tel:+8801XXXXXXXXX" className="hover:text-yellow-300 transition-colors duration-300">+880 1712 345678</a> {/* Example Dhaka mobile number */}
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-start space-x-6">
                        <Link
                            to="#"
                            className="text-yellow-300 hover:text-white transition-colors duration-300 transform hover:scale-125"
                            aria-label="Facebook"
                        >
                            <FaFacebook size={30} />
                        </Link>
                        <Link
                            to="#"
                            className="text-yellow-300 hover:text-white transition-colors duration-300 transform hover:scale-125"
                            aria-label="Twitter"
                        >
                            <FaTwitter size={30} />
                        </Link>
                        <Link
                            to="#"
                            className="text-yellow-300 hover:text-white transition-colors duration-300 transform hover:scale-125"
                            aria-label="Instagram"
                        >
                            <FaInstagram size={30} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar with Location */}
            <div className="bg-blue-900 py-4 mt-12"> {/* Darker blue for contrast */}
                <div className="container mx-auto px-6 text-center text-xs text-red-200"> {/* Changed text color */}
                    <p>Connecting Hearts in Dhaka, Bangladesh. | Every Drop Counts</p> {/* Updated location and tagline */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
