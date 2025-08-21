import React from 'react';
import { FaHeart, FaHandsHelping, FaUserFriends, FaArrowRight } from 'react-icons/fa'; // Icons for the features
import { Link } from 'react-router'; // For navigation
import Navbar from '../components/Navbar';

// NOTE: This is a placeholder Navbar component.
// Please replace this with your actual Navbar component code.


const AboutUs = () => {
    return (
        <div className="font-sans">
            {/* You should replace this with your actual Navbar component */}
            <Navbar />

            {/* Main content container with a subtle background gradient and rounded corners */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pt-24 p-4">
                <div className="container mx-auto max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 animate-fade-in-down">
                            Our Mission
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Connecting communities to save lives. LifeStream is dedicated to bridging the gap between those who need blood and those who are willing to donate.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Section: Our Story - organized for better readability */}
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            <div className="md:w-1/2">
                                <h2 className="text-4xl font-bold text-red-700 mb-4">Our Story</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    The idea for LifeStream was born from a simple but powerful observation: in critical moments, every second counts. Traditional methods of finding blood donors are often slow and inefficient, leading to avoidable tragedies. We wanted to create a modern, user-friendly platform that harnesses the power of technology and community to make a difference. By creating a seamless connection, we empower individuals to become heroes in their own neighborhoods.
                                </p>
                            </div>
                            <div className="md:w-1/2">
                                {/* Placeholder image or illustration */}
                                <div className="h-30 w-60 bg-gray-200 rounded-2xl shadow-lg flex items-center justify-center text-gray-500 italic">
                                    <img src="/resources/donateblood.png" alt="" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Why LifeStream? - uses a grid layout for features */}
                        <div className="py-8 text-center">
                            <h2 className="text-4xl font-bold text-blue-800 mb-8">Why Choose LifeStream?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Feature 1 */}
                                <div className="p-6 bg-blue-50 rounded-2xl shadow-lg border-t-4 border-blue-400 transform transition duration-300 hover:scale-105">
                                    <FaHeart className="text-red-600 text-4xl mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Community Driven</h3>
                                    <p className="text-gray-600">
                                        We are a platform built by the community, for the community. Your participation makes a real difference.
                                    </p>
                                </div>
                                {/* Feature 2 */}
                                <div className="p-6 bg-blue-50 rounded-2xl shadow-lg border-t-4 border-blue-400 transform transition duration-300 hover:scale-105">
                                    <FaHandsHelping className="text-red-600 text-4xl mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Easy & Fast</h3>
                                    <p className="text-gray-600">
                                        Our intuitive interface lets you find or register as a donor in just a few clicks.
                                    </p>
                                </div>
                                {/* Feature 3 */}
                                <div className="p-6 bg-blue-50 rounded-2xl shadow-lg border-t-4 border-blue-400 transform transition duration-300 hover:scale-105">
                                    <FaUserFriends className="text-red-600 text-4xl mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Reliable & Secure</h3>
                                    <p className="text-gray-600">
                                        With Firebase authentication, your data is protected and private.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Call to Action - a clear prompt for users to join */}
                        <div className="text-center py-8">
                            <h2 className="text-4xl font-bold text-red-700 mb-4">Join Us Today</h2>
                            <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
                                Be a hero in your community. Every donation has the power to save a life.
                            </p>
                            <Link
                                to="/auth/register"
                                className="btn btn-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center mx-auto max-w-xs"
                            >
                                Register Now <FaArrowRight className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
