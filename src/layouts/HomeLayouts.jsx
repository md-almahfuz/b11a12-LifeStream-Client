import React from 'react';
import { Outlet, useNavigation } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from '../pages/Loading';
import Events from '../pages/Events';
import ContactUs from '../components/ConatctUs';
import { GoogleMapsProvider } from '../contexts/GoogleMapsContext';

const HomeLayouts = () => {
    const { state } = useNavigation();

    return (

        <div>
            <header>
                <nav className='w-11/12 mx-auto bg-base-100 shadow-sm'>
                    <Navbar></Navbar>

                </nav>

            </header>
            <main className="w-11/12 grid grid-cols-12 mx-auto my-20 gap-5 ">
                <section className="main col-span-12 py-5">
                    {state == "loading" ? <Loading /> : <Outlet></Outlet>}
                </section>
            </main>
            {/* Events Section */}
            <div className="w-11/12 mx-auto my-3 ">
                <Events></Events>
            </div>


            {/* contact us section */}
            <GoogleMapsProvider>
                {/* This provider will make Google Maps API available to the ContactUs component */}
                <div className="w-11/12 mx-auto my-3 ">
                    <ContactUs></ContactUs>
                </div>

            </GoogleMapsProvider>


            {/* Footer */}
            <footer>
                <div className="w-11/12 mx-auto my-3 ">
                    <Footer></Footer>
                </div>
            </footer>
        </div>



    );
};

export default HomeLayouts;