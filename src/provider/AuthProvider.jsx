import React, { createContext, useState, useEffect } from 'react';
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
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import axios from 'axios';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    // The user state will now hold the full Firebase User object
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch the user's role with explicit token handling
    const fetchUserRole = async (idToken) => {
        try {
            const response = await axiosInstance.get('/get-user-role', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.data && response.data.role) {
                return response.data.role;
            } else {
                console.error("API response for user role is missing role data.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            toast.error("Failed to load user role. Please try logging in again.");
            return null;
        }
    };

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

    // Logout function
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    // Function to update user profile
    const updateUserProfile = (profileUpdates) => {
        return updateProfile(auth.currentUser, profileUpdates);
    };

    // Function to get the current user's ID token
    const getFirebaseIdToken = async () => {
        if (auth.currentUser) {
            return await auth.currentUser.getIdToken();
        }
        return null;
    };

    // Firebase Auth State Observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Get the ID token for the role check
                    const idToken = await currentUser.getIdToken();
                    const userRole = await fetchUserRole(idToken);

                    if (userRole) {
                        // Store the original Firebase User object and add the role property
                        currentUser.role = userRole;
                        setUser(currentUser);
                    } else {
                        // Role fetch failed, log out the user
                        await signOut(auth);
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error during auth state change:", error);
                    await signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            // Ensure loading is set to false only after all checks are complete
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
        getFirebaseIdToken, // Pass the new function to the context
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
