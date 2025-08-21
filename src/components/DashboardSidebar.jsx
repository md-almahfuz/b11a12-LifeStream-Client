import { NavLink } from "react-router";
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

    // This is the correct way to get user data from the central AuthContext
    const { user, loading } = useContext(AuthContext);

    // This is the crucial check to prevent the TypeError
    if (loading || !user) {
        return <h1>Loading...</h1>;
    }

    const role = user.role;

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
                    icon={<FaList size={20} />}
                    label="All Users"
                />
                <NavItem
                    to="/dashboard/all-donation-requests"
                    icon={<FaBookOpen size={20} />}
                    label="All Donation Requests"
                />
                <NavItem
                    to="/dashboard/content-management"
                    icon={<FaHandHoldingHeart size={20} />}
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
                    icon={<FaHome size={20} />}
                    label="Volunteer Dashboard Home"
                />
                <NavItem
                    to="/dashboard/all-donation-requests"
                    icon={<FaBookOpen size={20} />}
                    label="All Donation Requests"
                />
                <NavItem
                    to="/dashboard/content-management"
                    icon={<FaHandHoldingHeart size={20} />}
                    label="Content Management"
                />
                <NavItem
                    to="/dashboard/profile"
                    icon={<FaUser size={20} />}
                    label="Profile"
                />
            </nav>
        );

    // donor sidebar
    return (
        <nav className="flex flex-col gap-4">
            <NavItem
                to="/dashboard"
                icon={<FaHome size={20} />}
                label="Donor Dashboard"
            />
            <NavItem
                to="/dashboard/create-donation-request"
                icon={<FaPlusCircle size={20} />}
                label="Add a Request"
            />
            <NavItem
                to="/dashboard/all-requests"
                icon={<FaList size={20} />}
                label="My Requests"
            />
            <NavItem
                to="/dashboard/profile"
                icon={<FaUser size={20} />}
                label="Profile"
            />
        </nav>
    );
}
