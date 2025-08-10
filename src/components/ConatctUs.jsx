import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaHeartbeat } from 'react-icons/fa'; // Added FaHeartbeat
import { GoogleMap, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { useGoogleMaps } from '../contexts/GoogleMapsContext'; // Import your custom hook

// Map container style
const containerStyle = {
    width: '100%',
    height: '350px',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

// Map options
const mapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
};

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send this data to your backend
        console.log('Contact Form Submitted:', formData);
        toast.success('Your message has been sent! We will get back to you soon.');
        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    // Default center for the map: Uttara, Dhaka, Bangladesh (approx. 23.877°N, 90.377°E)
    const defaultCenter = {
        lat: 23.877,
        lng: 90.377
    };

    // Get isLoaded and loadError from the context
    const { isLoaded, loadError } = useGoogleMaps();

    return (
        <section className="py-12 bg-gradient-to-br from-red-50 to-blue-50 rounded-3xl shadow-xl border border-red-200 my-12 px-6 md:px-10"> {/* Themed gradient */}
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-red-800 mb-4 leading-tight"> {/* Themed color */}
                    <FaHeartbeat className="inline-block text-red-600 mr-3" /> Get in Touch
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    We're here to help you with your blood donation inquiries. Reach out to us!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 flex flex-col justify-between"> {/* Themed border */}
                    <div>
                        <h3 className="text-3xl font-bold text-red-800 mb-6 border-b-2 border-red-300 pb-3">Our Details</h3> {/* Themed color */}
                        <div className="space-y-6 text-lg text-gray-700">
                            <p className="flex items-center">
                                <FaPhoneAlt className="mr-4 text-red-600 text-2xl" /> {/* Themed icon color */}
                                <span>Phone: +880 1712 345678</span> {/* Updated Dhaka phone number */}
                            </p>
                            <p className="flex items-center">
                                <FaEnvelope className="mr-4 text-red-600 text-2xl" /> {/* Themed icon color */}
                                <span>Email: info@lifestream.com</span> {/* Updated email */}
                            </p>
                            <p className="flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-red-600 text-2xl" /> {/* Themed icon color */}
                                <span>Address: Uttara, Dhaka, Bangladesh</span> {/* Updated address */}
                            </p>
                        </div>
                    </div>
                    {/* Google Map */}
                    <div className="w-full mt-8">
                        {isLoaded && (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={defaultCenter}
                                zoom={14}
                                options={mapOptions}
                            >
                                <Marker position={defaultCenter} />
                            </GoogleMap>
                        )}
                        {loadError && (
                            <p className="text-red-500 text-center mt-4">Error loading maps: {loadError.message}</p>
                        )}
                        {!isLoaded && !loadError && (
                            <div className="flex items-center justify-center h-40 bg-gray-200 rounded-lg">
                                <p className="text-gray-600">Loading Map...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100"> {/* Themed border */}
                    <h3 className="text-3xl font-bold text-red-800 mb-6 border-b-2 border-red-300 pb-3">Send Us a Message</h3> {/* Themed color */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" // Themed focus ring
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Your Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" // Themed focus ring
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-gray-700 text-sm font-semibold mb-2">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" // Themed focus ring
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-gray-700 text-sm font-semibold mb-2">Your Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-y" // Themed focus ring
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-md transform hover:scale-105 flex items-center justify-center" // Themed button
                        >
                            Send Message <FaPaperPlane className="ml-2" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
