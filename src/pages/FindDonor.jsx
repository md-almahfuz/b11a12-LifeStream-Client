import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance'; // Your configured Axios instance
import { FaSearch, FaTint, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import axios from 'axios'; // For axios.isAxiosError

const FindDonor = () => {
    const [searchCriteria, setSearchCriteria] = useState({
        bloodGroup: '',
        district: '',
        upazila: '',
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);

    // Load districts and upazilas from JSON files on component mount
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                const districtsRes = await fetch('/data/districts.json');
                const districtsJson = await districtsRes.json();
                setDistricts(districtsJson[2].data);

                const upazilasRes = await fetch('/data/upazilas.json');
                const upazilasJson = await upazilasRes.json();
                setAllUpazilas(upazilasJson[2].data);
            } catch (err) {
                console.error("Failed to load location data:", err);
                toast.error("Failed to load location data for search.");
            }
        };
        loadLocationData();
    }, []);

    // Effect to filter upazilas when district changes
    useEffect(() => {
        if (searchCriteria.district) {
            const selectedDistrictId = districts.find(d => d.name === searchCriteria.district)?.id;
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
        setSearchCriteria(prev => ({ ...prev, upazila: '' }));
    }, [searchCriteria.district, districts, allUpazilas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearchResults([]); // Clear previous results

        const { bloodGroup, district, upazila } = searchCriteria;

        if (!bloodGroup) {
            toast.error("Please select a blood group to search.");
            setLoading(false);
            return;
        }

        try {
            // Construct query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('bloodGroup', bloodGroup);
            if (district) queryParams.append('district', district);
            if (upazila) queryParams.append('upazila', upazila);

            // Make API call to backend
            const response = await axiosInstance.get(`/search-donors?${queryParams.toString()}`);
            setSearchResults(response.data);
            if (response.data.length === 0) {
                toast.info("No donors found matching your criteria.");
            } else {
                toast.success(`Found ${response.data.length} donor(s)!`);
            }
        } catch (err) {
            console.error("Error searching for donors:", err);
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                setError({ message: err.response.data.message });
                toast.error(`Search failed: ${err.response.data.message}`);
            } else {
                setError({ message: "Failed to search for donors. Please try again." });
                toast.error(`Search failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-red-800 mb-2">Find a Blood Donor</h1>
                    <p className="text-lg text-gray-600">Connect with life-savers in your area.</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-red-50 rounded-lg shadow-inner border border-red-200">
                    {/* Blood Group */}
                    <div>
                        <label htmlFor="bloodGroup" className="block text-gray-700 text-sm font-semibold mb-2">Blood Group</label>
                        <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={searchCriteria.bloodGroup}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

                    {/* District */}
                    <div>
                        <label htmlFor="district" className="block text-gray-700 text-sm font-semibold mb-2">District (Optional)</label>
                        <select
                            id="district"
                            name="district"
                            value={searchCriteria.district}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">Select district</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upazila */}
                    <div>
                        <label htmlFor="upazila" className="block text-gray-700 text-sm font-semibold mb-2">Upazila (Optional)</label>
                        <select
                            id="upazila"
                            name="upazila"
                            value={searchCriteria.upazila}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={!searchCriteria.district}
                        >
                            <option value="">Select upazila</option>
                            {filteredUpazilas.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                        {!searchCriteria.district && (
                            <p className="text-sm text-gray-500 mt-1">Select a district first.</p>
                        )}
                    </div>

                    <div className="md:col-span-3 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md flex items-center justify-center text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Searching...
                                </>
                            ) : (
                                <>
                                    <FaSearch className="mr-2" /> Find Donors
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Search Results */}
                <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-3">Search Results</h2>
                {error && (
                    <div className="text-center text-red-500 text-lg py-4">
                        <p>{error.message}</p>
                    </div>
                )}
                {!loading && searchResults.length === 0 && !error && (
                    <div className="text-center text-gray-600 text-lg py-4">
                        <p>Enter your criteria above and click "Find Donors" to see results.</p>
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="ml-3 text-lg text-gray-700">Fetching donors...</p>
                    </div>
                )}
                {!loading && searchResults.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table w-full border-collapse">
                            {/* Head */}
                            <thead className="bg-blue-100 text-blue-800 uppercase text-sm">
                                <tr>
                                    <th className="p-3 text-left rounded-tl-lg">Donor Name</th>
                                    <th className="p-3 text-left">Blood Group</th>
                                    <th className="p-3 text-left">District</th>
                                    <th className="p-3 text-left">Upazila</th>
                                    <th className="p-3 text-left rounded-tr-lg">Contact (Email)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((donor) => (
                                    <tr key={donor._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800 flex items-center">
                                            <FaUser className="mr-2 text-blue-500" />
                                            {donor.name || 'Anonymous Donor'}
                                        </td>
                                        <td className="p-3 flex items-center">
                                            <FaTint className="text-red-500 mr-2" />
                                            <span className="font-bold">{donor.bloodGroup || 'N/A'}</span>
                                        </td>
                                        <td className="p-3 text-gray-700">{donor.district || 'N/A'}</td>
                                        <td className="p-3 text-gray-700">{donor.upazila || 'N/A'}</td>
                                        <td className="p-3 text-blue-600 hover:underline">
                                            <a href={`mailto:${donor.email}`}>{donor.email || 'N/A'}</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindDonor;
