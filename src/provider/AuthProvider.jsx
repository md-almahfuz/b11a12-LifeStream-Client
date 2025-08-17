// src/provider/AuthProvider.js

import React, { createContext, useEffect, useState } from 'react';
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

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // CHANGE: Replaced isAdmin with a more flexible userRole state
    const [userRole, setUserRole] = useState('donor'); // Default role is 'donor'

    console.log("AuthProvider initialized with userRole:", userRole);

    // Function to get Firebase ID token
    const getFirebaseIdToken = async (refresh = false) => {
        if (auth.currentUser) {
            return auth.currentUser.getIdToken(refresh);
        }
        return null;
    };

    // NEW: Function to check a user's role from the backend
    const checkUserRole = async (uid, idToken) => {
        try {
            // Assuming your backend has an endpoint like /users/role/:uid that returns { role: 'admin' } or { role: 'volunteer' }
            // const response = await axiosInstance.get(`/get-user-role/${uid}`, {
            const response = await axiosInstance.get(`/get-user-role`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            setUserRole(response.data.role); // Set role to 'admin', 'volunteer', or 'user'
        } catch (error) {
            console.error("Failed to check user role:", error);
            setUserRole('user'); // Default to 'user' on error or network failure
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

    const logOut = () => {
        setLoading(true);
        // CHANGE: Reset userRole on logout
        setUserRole('user');
        return signOut(auth);
    };

    const updateUserProfile = (profileUpdates) => {
        console.log("Updating Firebase user profile with:", profileUpdates);
        return updateProfile(auth.currentUser, profileUpdates);
    };

    // Firebase Auth State Observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const idToken = await currentUser.getIdToken();
                    setUser({ ...currentUser, accessToken: idToken });
                    // Check user role after a user is authenticated
                    await checkUserRole(currentUser.uid, idToken);
                } catch (error) {
                    console.error("Error getting Firebase ID token or checking user role:", error);
                    setUser(currentUser);
                    setUserRole('user');
                }
            } else {
                setUser(null);
                // CHANGE: Reset userRole on logout
                setUserRole('user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        // CHANGE: Expose userRole instead of isAdmin
        userRole,
        createUser,
        signIn,
        signInWithGoogle,
        logOut,
        updateUserProfile,
        getFirebaseIdToken,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;