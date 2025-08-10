import Navbar from '../components/Navbar';
import { Outlet } from 'react-router';

const AuthLayout = () => {
    return (
        <div className="bg-base-200 min-h-screen">
            <header className="w-11/12 mx-auto my-3">
                <Navbar />
            </header>
            <main className="w-11/12 mx-auto my-3 gap-5">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;