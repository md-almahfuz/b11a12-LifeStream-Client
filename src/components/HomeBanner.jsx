import React from 'react';
import { Link } from 'react-router';
import { FaSearch, FaHeart, FaTint, FaHandHoldingHeart } from 'react-icons/fa'; // Icons for search and donation

const HomeBanner = () => {
    return (
        <div className="relative min-h-[60vh] w-full flex items-center justify-center text-center px-4 py-16 bg-cover bg-center
             bg-gradient-to-br from-red-700 to-blue-800 " // Changed to a gradient background
            style={{ /* backgroundImage: "url('https://placehold.co/1920x1080/EF4444/FFFFFF/png?text=LifeStream+Heroes')" */ }}> {/* Removed background image for cleaner gradient */}

            {/* Removed overlay as gradient provides enough contrast */}
            {/* <div className="absolute inset-0 bg-black opacity-60"></div> */}

            <div className="relative z-10 max-w-screen-xl w-full mx-auto text-white"> {/* Adjusted width to w-11/12 */}
                <div className="bg-black bg-opacity-50 p-8 rounded-2xl shadow-2xl inline-block animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        <span className="text-red-300">Be a Hero.</span> Save a Life.
                    </h1>
                    <p className="text-xl md:text-2xl leading-relaxed drop-shadow-md">
                        Every drop of blood is a drop of hope. Join LifeStream to connect, donate, and make a profound difference.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                    {/* Card for Finding a Donor */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-300 transform hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center"> {/* Solid white background for cards */}
                        <FaSearch className="text-red-600 text-5xl mb-4" /> {/* Themed icon color */}
                        <h2 className="text-3xl font-bold mb-3 text-red-800">In Urgent Need?</h2> {/* Themed text color */}
                        <p className="text-lg mb-6 text-gray-700 leading-relaxed"> {/* Darker text for readability on white */}
                            Find a matching blood donor near you, quickly and efficiently. Your search for hope ends here.
                        </p>
                        <Link
                            to="/search-donor"
                            className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center text-lg"
                        >
                            <FaTint className="mr-3" /> Find a Donor
                        </Link>
                    </div>

                    {/* Card for Becoming a Donor */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-300 transform hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center"> {/* Solid white background for cards */}
                        <FaHandHoldingHeart className="text-blue-600 text-5xl mb-4" /> {/* Themed icon color */}
                        <h2 className="text-3xl font-bold mb-3 text-blue-800">Become a Life-Saver</h2> {/* Themed text color */}
                        <p className="text-lg mb-6 text-gray-700 leading-relaxed"> {/* Darker text for readability on white */}
                            Your selfless act can bring a new dawn to someone's life. Join our community of heroes today.
                        </p>
                        <Link
                            to="/auth/register"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center text-lg"
                        >
                            <FaHeart className="mr-3" /> Join as a Donor
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBanner;
