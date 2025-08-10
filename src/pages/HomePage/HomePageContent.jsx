import React from 'react';
import HomeBanner from '../../components/HomeBanner';
import ShowDonationRequests from '../ShowDonationRequests';
import ShowPendingRequests from '../../components/ShowPendingRequests';

const HomePageContent = () => {
    return (
        <>
            <HomeBanner />
            <ShowPendingRequests />
        </>
    );
};

export default HomePageContent;