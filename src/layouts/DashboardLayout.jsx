import { Outlet } from "react-router";
import { Link } from "react-router"; // Ensure Link is from react-router-dom
import DashboardSidebar from "../components/DashboardSidebar";
import { FaSignOutAlt } from 'react-icons/fa'; // Import the exit icon

const DashboardLayout = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-5 hidden md:flex flex-col"> {/* Added flex-col */}
                <Link to="/" className="block text-center mb-10">
                    <img
                        src="/resources/LifeStream.png"
                        alt="LifeStream Logo"
                        className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
                    />
                    <div className="text-2xl font-bold text-blue-600">
                        LifeStream
                    </div>
                </Link>

                <div className="flex-1"> {/* This div will take up remaining space, pushing the exit link down */}
                    <DashboardSidebar />
                </div>

                {/* --- Exit Portal Link at the bottom of the sidebar --- */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <Link
                        to="/" // Link to your home page or a logout route
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt size={20} /> Exit Portal
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
