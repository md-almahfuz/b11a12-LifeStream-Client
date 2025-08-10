import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaGift, FaUsers, FaGraduationCap, FaHeartbeat } from 'react-icons/fa'; // Ensure FaHeartbeat is imported
import { Link } from 'react-router'; // Changed from 'react-router' to 'react-router-dom'

const events = [
    {
        id: 'du-1',
        institution: 'Dhaka University',
        date: 'August 15, 2025',
        time: '10:00 AM - 4:00 PM',
        location: 'TSC Auditorium, Dhaka University',
        message: 'Join us at Dhaka University to make a difference! Your single donation can save up to three lives.',
        gifts: ['LifeStream T-Shirt', 'Stylish Hat'],
        image: 'https://placehold.co/400x200/B71C1C/FFFFFF?text=Dhaka+University+Event' // Placeholder image
    },
    {
        id: 'buet-1',
        institution: 'Bangladesh University of Engineering and Technology (BUET)',
        date: 'August 20, 2025',
        time: '9:00 AM - 3:00 PM',
        location: 'Central Cafeteria Hall, BUET',
        message: 'Be a hero at BUET! Your selfless act of kindness will bring hope to those in critical need.',
        gifts: ['LifeStream T-Shirt', 'Branded Keychain'],
        image: 'https://placehold.co/400x200/D32F2F/FFFFFF?text=BUET+Event' // Placeholder image
    },
    {
        id: 'nsu-1',
        institution: 'North South University',
        date: 'August 25, 2025',
        time: '11:00 AM - 5:00 PM',
        location: 'Plaza Area, NSU Campus',
        message: 'NSU students, your blood can bring a smile! Experience the joy of giving back to your community.',
        gifts: ['LifeStream Hat', 'Custom Pen'],
        image: 'https://placehold.co/400x200/E53935/FFFFFF?text=NSU+Event' // Placeholder image
    },
    {
        id: 'du-med-1',
        institution: 'Dhaka Medical College and Hospital',
        date: 'September 01, 2025',
        time: '9:30 AM - 4:30 PM',
        location: 'Medical College Auditorium, Dhaka',
        message: 'Future healthcare leaders, set an example! Your donation is a direct lifeline for patients.',
        gifts: ['LifeStream T-Shirt', 'Reusable Water Bottle'],
        image: 'https://placehold.co/400x200/F44336/FFFFFF?text=DMC+Event' // Placeholder image
    },
    {
        id: 'ru-1',
        institution: 'Rajshahi University',
        date: 'September 05, 2025',
        time: '10:00 AM - 4:00 PM',
        location: 'Central Library Ground, RU',
        message: 'Students of Rajshahi University, your contribution can ignite hope. Be a part of this noble cause!',
        gifts: ['LifeStream T-Shirt', 'Wristband'],
        image: 'https://placehold.co/400x200/C62828/FFFFFF?text=RU+Event' // Placeholder image
    }
];

const Events = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-red-800 mb-4 animate-fade-in-down">
                        <FaHeartbeat className="inline-block text-red-600 mr-3" />
                        Upcoming Blood Donation Drives!
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                        Join LifeStream at various educational institutions across Bangladesh. Your participation helps us save countless lives. Meet our dedicated team, register on-site, and receive exciting gifts as a token of our gratitude!
                    </p>
                </div>

                {/* Main container for horizontal scrolling */}
                <div className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100">
                    {events.map(event => (
                        <div key={event.id} className="
                            flex-shrink-0 w-80 md:w-96 lg:w-80 xl:w-96
                            bg-white rounded-xl shadow-lg overflow-hidden border border-red-200
                            transform hover:scale-103 transition-transform duration-300 group
                            relative
                        ">
                            <img
                                src={event.image}
                                alt={`${event.institution} Event`}
                                className="w-full h-40 object-cover group-hover:brightness-90 transition-all duration-300"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x160/CCCCCC/333333?text=Image+Not+Found"; }}
                            />
                            <div className="p-4"> {/* Reduced padding */}
                                <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center"> {/* Smaller font */}
                                    <FaGraduationCap className="mr-2 text-blue-600" /> {event.institution}
                                </h2>
                                <p className="text-gray-700 text-sm mb-3 leading-snug line-clamp-3">{event.message}</p> {/* Smaller font, line clamp */}

                                <div className="space-y-1 text-gray-800 mb-4 text-sm"> {/* Smaller font, less space */}
                                    <p className="flex items-center">
                                        <FaCalendarAlt className="mr-2 text-red-500" />
                                        <span className="font-semibold">{event.date}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <FaClock className="mr-2 text-red-500" />
                                        <span className="font-semibold">{event.time}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                                        <span className="font-semibold">{event.location}</span>
                                    </p>
                                </div>

                                <div className="bg-red-50 p-3 rounded-lg flex items-center mb-4 border border-red-200"> {/* Reduced padding */}
                                    <FaGift className="text-red-600 text-2xl mr-3" /> {/* Smaller icon */}
                                    <div>
                                        <h4 className="text-base font-bold text-red-700">Receive Gifts!</h4> {/* Smaller font */}
                                        <p className="text-gray-700 text-xs">{event.gifts.join(', ')}</p> {/* Smaller font */}
                                    </div>
                                </div>

                                <div className="flex justify-center mt-4"> {/* Centered button */}
                                    <Link
                                        to="/auth/register"
                                        className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center text-sm" // Smaller button
                                    >
                                        <FaUsers className="mr-2" /> Register Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
