// // In your useRole.js (frontend hook)

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // Directly import your axiosInstance

export default function useRole() {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (axiosInstance) {
            axiosInstance("/get-user-role")
                .then((res) => {
                    setRole(res.data.role); // This will now safely receive 'donor' if not found in DB
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching user role:", error);
                    setLoading(false);
                    setRole("donor"); // Fallback to 'donor' on any fetch error
                });
        }
    }, []); // Empty dependency array: runs only once after the initial render

    return { role, loading };
}


// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../provider/AuthProvider";

// const useRole = () => {
//     // Destructure the user and loading state from the AuthContext
//     const { user, loading } = useContext(AuthContext);

//     // The role state will be derived from the user object
//     const [role, setRole] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         // We use the loading state from AuthContext to determine if the user object is ready
//         if (loading) {
//             setIsLoading(true);
//             return;
//         }

//         // Set the role directly from the user object's role property
//         // The role property is added to the user object by the AuthProvider
//         if (user) {
//             setRole(user.role || "donor");
//         } else {
//             // If there's no user, set the default role
//             setRole("donor");
//         }

//         setIsLoading(false);

//     }, [user, loading]); // Depend on user and loading from context

//     return { role, isLoading };
// };

// export default useRole;
// import { useContext } from "react";
// import { AuthContext } from "../provider/AuthProvider";

// const useRole = () => {
//     // Destructure the userRole and its loading state directly from the AuthContext
//     const { userRole, isRoleLoading } = useContext(AuthContext);

//     // The role and isLoading are now directly provided by the AuthContext,
//     // so we just return them. No need for internal state or effects.
//     return { role: userRole, isLoading: isRoleLoading };
// };

// export default useRole;


// import { useContext } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import axiosInstance from '../api/axiosInstance';
// import { AuthContext } from '../provider/AuthProvider';

// const useRole = () => {
//     // We still get the user from AuthContext to check if they are logged in
//     const { user, loading } = useContext(AuthContext);

//     const { data: role, isLoading } = useQuery({
//         queryKey: ['userRole', user?.email], // Unique key for the query, tied to the user's email
//         queryFn: async () => {
//             // Check if there is a user and the authentication is not loading
//             if (user && !loading) {
//                 const response = await axiosInstance.get('/get-user-role');
//                 return response.data.role; // Return the role
//             }
//             return 'donor'; // Default role if no user is logged in
//         },
//         // Only fetch the data if the user object is not null and not loading
//         enabled: !!user && !loading,
//         staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
//         retry: false, // Do not retry on failure
//         initialData: 'donor' // Default role while fetching
//     });

//     // The hook returns the role and a combined loading state.
//     // The role will be "donor" until the fetch completes.
//     return { role, isLoading: loading || isLoading };
// };

// export default useRole;

