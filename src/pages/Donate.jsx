import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import fx from 'money';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51RoRRuH4iDmiBmz9aheuTZ0irnNCXCBNYAYnJcZigCoLgDTHO0f1BS9faVMVL7rFZcJyryZIEDSMJg1q5RKtjWfg00pUPGpilq');

const DonationForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [donationAmount, setDonationAmount] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [user, setUser] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [isRatesLoaded, setIsRatesLoaded] = useState(false);

    // Use useEffect to get the current authenticated user from Firebase
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // New useEffect to fetch and set currency exchange rates
    useEffect(() => {
        // You would replace this with a real API call to get live rates.
        const mockFetchRates = async () => {
            try {
                const rates = {
                    "AUD": 1,
                    "BDT": 79
                };
                fx.rates = rates;
                fx.base = "AUD";
                setIsRatesLoaded(true);
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
                toast.error("Failed to load currency rates. Please try again later.");
            }
        };

        mockFetchRates();
    }, []);

    const resetForm = () => {
        setDonationAmount(10);
        setPaymentSuccess(false);
        setPaymentError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user) {
            toast.error("Please sign in to make a donation.");
            return;
        }

        if (!stripe || !elements || !isRatesLoaded) {
            toast.error("Payment services are not yet loaded. Please wait a moment.");
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);
        setPaymentSuccess(false);

        // Convert the donation amount before sending it to the backend
        const convertedBDTAmmount = fx.convert(donationAmount, { from: "AUD", to: "BDT" });
        setConvertedAmount(convertedBDTAmmount);

        try {
            const response = await axiosInstance.post('/create-payment-intent', {
                amount: donationAmount * 100 // Stripe API expects the amount in cents
            });

            const { clientSecret } = response.data;

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (error) {
                setPaymentError(error.message);
                toast.error(`Payment failed: ${error.message}`);
                console.error("Stripe payment error:", error);
            } else if (paymentIntent.status === 'succeeded') {
                setPaymentSuccess(true);
                toast.success(`Thank you for your generous donation of ${donationAmount} AUD (${convertedBDTAmmount.toFixed(2)} BDT)!`);
                console.log("Payment succeeded:", paymentIntent);

                try {
                    // Send user email, UID, AND the converted amount to the backend
                    await axiosInstance.post('/save-donation', {
                        paymentIntentId: paymentIntent.id,
                        userId: user.uid,
                        userEmail: user.email,
                        amount: convertedBDTAmmount, // Send the converted amount in BDT
                        currency: "BDT",
                    });
                    console.log("Donation data successfully saved to backend.");
                } catch (saveError) {
                    console.error("Failed to save donation data to backend:", saveError);
                    toast.warn("Payment was successful, but there was an issue recording it. Please contact support.");
                }

                resetForm();
            } else {
                setPaymentError('An unexpected error occurred. Please try again.');
                toast.error('An unexpected error occurred.');
            }
        } catch (err) {
            setPaymentError(`Failed to process payment: ${err.message}`);
            toast.error(`Failed to process payment: ${err.message}`);
            console.error("Backend request error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl text-gray-600">Please sign in to make a donation.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Make a Donation</h3>

            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="donation-amount">
                    Donation Amount (AUD)
                </label>
                <input
                    id="donation-amount"
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
                    min="1"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
            </div>

            <div className="mb-6">
                <p className="block text-gray-700 font-medium mb-2">
                    Donating as: <span className="font-bold text-blue-600">{user.email}</span>
                </p>
                <p className="text-sm text-gray-500">
                    Your donation will be linked to your account.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                    Card Details
                </label>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <CardElement className="p-2" options={{
                        style: { base: { fontSize: '16px' } },
                        hidePostalCode: true,
                    }} />
                </div>
            </div>

            {paymentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {paymentError}
                </div>
            )}

            {paymentSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    Payment successful!
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing || !isRatesLoaded}
                className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
            >
                {isProcessing ? `Processing...` : isRatesLoaded ? `Donate AUD$${donationAmount}` : `Loading...`}
            </button>

            {paymentSuccess && (
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 w-full px-8 py-4 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
                >
                    Go to Home
                </button>
            )}
        </form>
    );
};

const Donate = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Support Our Mission</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Your generous donation helps us continue our work. Thank you for your support!
                        </p>
                    </div>
                    <Elements stripe={stripePromise}>
                        <DonationForm />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default Donate;