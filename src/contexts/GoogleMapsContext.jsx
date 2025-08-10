import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GoogleMapsContext = createContext(null);

const mapKey = import.meta.env.VITE_Maps_API_KEY; // Use your actual environment variable for the API key

console.log("Google Maps API Key:", mapKey); // Debugging: Check if the key is loaded correctly

export const useGoogleMaps = () => {
    const context = useContext(GoogleMapsContext);
    if (!context) {
        throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
    }
    return context;
};

export const GoogleMapsProvider = ({ children }) => {
    // IMPORTANT: Use your actual environment variable for the API key.
    // For Vite, it's `import.meta.env.VITE_Maps_API_KEY`
    // Ensure your .env file in the project root has: VITE_Maps_API_KEY=YOUR_Maps_API_KEY
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: mapKey,
        libraries: ['places'], // Keep 'places' if you need it for geocoding, autocomplete etc.
        language: 'en', // Optional: specify language
        region: 'BD',   // Optional: specify region for geocoding bias
    });

    const value = { isLoaded, loadError };

    return (
        <GoogleMapsContext.Provider value={value}>
            {children}
        </GoogleMapsContext.Provider>
    );
};