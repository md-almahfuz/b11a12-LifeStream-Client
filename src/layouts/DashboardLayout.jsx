import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router";
import DashboardSidebar from "../components/DashboardSidebar";
import { FaSignOutAlt, FaDonate } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleDonateClick = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will exit your dashboard and take you to the secure Donate Money Portal.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, proceed!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Navigate to the donate page if the user confirms
                navigate('/auth/donate');
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-red-50">
            {/* Sidebar with a complementary background color */}
            <aside className="w-64 bg-white shadow-lg p-5 hidden md:flex flex-col">
                <Link to="/" className="block text-center mb-10">
                    <img
                        src="/resources/LifeStream.png"
                        alt="LifeStream Logo"
                        className="w-40 h-25 mx-auto mb-4 rounded-full object-cover"
                    />
                    <div className="text-2xl font-bold text-blue-600">
                        LifeStream
                    </div>
                </Link>

                {/* This div will push the buttons to the bottom */}
                <div className="flex-1">
                    <DashboardSidebar />
                </div>

                {/* --- Donate and Exit Portal buttons --- */}
                <div className="pt-4 border-t border-gray-200">
                    {/* Donate Money button */}
                    <button
                        onClick={handleDonateClick}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-blue-600 hover:bg-blue-100 transition-colors duration-200 w-full mb-2"
                    >
                        <FaDonate size={20} /> Donate Money
                    </button>

                    {/* Exit Portal Link */}
                    <Link
                        to="/"
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
