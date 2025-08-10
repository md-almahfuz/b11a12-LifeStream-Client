import { Navigate } from "react-router";
import useRole from "../hooks/useRole";
import AdminDashboard from "./AdminDashboard";
import DonorDashboard from "./DonorDashboard";
import VolunteerDashboard from "./VolunteerDashboard";

export default function Dashboard() {
    const { role, loading } = useRole();

    if (loading) {
        return <h1>Loading</h1>;
    }

    if (role === "donor") {
        return <div><DonorDashboard></DonorDashboard>Dashboard</div>
    }
    if (role === "volunteer") {
        return <div><VolunteerDashboard></VolunteerDashboard></div>;
    }

    if (role === "admin") {
        return <AdminDashboard />;
    }

    return <Navigate to={"/"} />;
}
