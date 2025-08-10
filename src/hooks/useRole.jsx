// In your useRole.js (frontend hook)

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