import { NavLink } from "react-router";
import useRole from "../hooks/useRole";
import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";
// Assuming you have icons like FaHome, FaUser, etc., if not, you'll need to import them or use text
import { FaHome, FaUser, FaPlusCircle, FaList, FaBookOpen, FaHandHoldingHeart } from 'react-icons/fa';


export default function DashboardSidebar() {
    const NavItem = ({ to, icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium ${isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`
            }
        >
            {icon} {label}
        </NavLink>
    );

    const { role, loading } = useRole();
    const { user, getFirebaseIdToken } = useContext(AuthContext);


    if (loading) return <h1>Loading...</h1>;

    if (role === "admin")
        return (
            <nav className="flex flex-col gap-4">
                <NavItem
                    to="/dashboard"
                    icon={<FaHome size={20} />}
                    label="Admin Dashboard Home"
                />
                <NavItem
                    to="/dashboard/all-users"
                    icon={<FaList size={20} />} // Changed to FaList for All Users
                    label="All Users"
                />
                <NavItem
                    to="/dashboard/all-donation-requests"
                    icon={<FaBookOpen size={20} />} // Changed to FaBookOpen for My Books
                    label="All Donation Requests"
                />
                {/* FIX: Corrected the path for My Requests */}
                <NavItem
                    to="/dashboard/content-management" // This path is static, loader handles user.uid
                    icon={<FaHandHoldingHeart size={20} />} // Using FaHandHoldingHeart for My Requests
                    label="Content Management"
                />
                <NavItem
                    to="/dashboard/profile"
                    icon={<FaUser size={20} />}
                    label="Profile"
                />

            </nav>
        );
    if (role === "volunteer")
        return (
            <nav className="flex flex-col gap-4">
                <NavItem
                    to="/dashboard"
                    icon={<FaHome size={20} />} // Added icon
                    label="Volunteer Dashboard Home"
                />
                <NavItem
                    to="/dashboard/all-donation-requests"
                    icon={<FaBookOpen size={20} />} // Changed to FaBookOpen for My Books
                    label="All Donation Requests"
                />
                <NavItem
                    to="/dashboard/content-management" // This path is static, loader handles user.uid
                    icon={<FaHandHoldingHeart size={20} />} // Using FaHandHoldingHeart for My Requests
                    label="Content Management"
                />

            </nav>
        );

    // donor sidebar
    return (
        <nav className="flex flex-col gap-4">
            <NavItem
                to="/dashboard"
                icon={<FaHome size={20} />} // Added icon
                label="Donor Dashboard"
            />

            <NavItem
                to="/dashboard/create-donation-request"
                icon={<FaPlusCircle size={20} />} // Added icon
                label="Add a Request"
            />
            <NavItem
                to="/dashboard/my-donation-requests" // This path is static, loader handles user.uid
                icon={<FaList size={20} />} // Added icon
                label="My Requests"
            />
            <NavItem
                to="/dashboard/profile"
                icon={<FaUser size={20} />} // Added icon
                label="Profile"
            />

        </nav>
    );
}
