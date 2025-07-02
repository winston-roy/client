import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

function Premium() {
    const [error, setError] = useState("");
    const [isUserPremium, setIsUserPremium] = useState(false);

    useEffect(() => {
        verifyPremiumUser()
    }, []);

    const plans = [
        {
            name: 'Silver Membership',
            price: '₹299/month',
            features: ['Blue Tick', 'Chat with other people', '100 Connection Request Per Day'],
            buttonColor: 'btn-secondary',
            bg: 'bg-black-100',
            p_name: "silver"
        },
        {
            name: 'Gold Membership',
            price: '₹499/month',
            features: ['Blue Tick', 'Chat with other people', '1000 Connection Request Per Day', 'See who liked you', 'Unlimited Swipes'],
            buttonColor: 'btn-primary',
            bg: 'bg-black-100',
            p_name: "gold"
        },
    ];

    const verifyPremiumUser = async () => {
        const res = await axios.get(BASE_URL + '/payment/premium/verify', { withCredentials: true });

        if (res.data.data.isPremium) {
            setIsUserPremium(true)
        }
    }

    const handleBuy = async (type) => {
        try {
            const order = await axios.post(BASE_URL + '/payment/create',
                {
                    membershipType: type
                },
                { withCredentials: true })

            //It should open a razorpay dialouge
            const { amount, keyId, currency, notes, orderId, } = order.data.data;

            const options = {
                key: keyId,
                amount,
                currency,
                name: 'Dev Tinder',
                description: 'Test Transaction Dev Tinder',
                order_id: orderId,
                prefill: {
                    name: notes.firstName + " " + notes.lastName,
                    email: notes.email,
                    contact: notes.phoneNumber
                },
                theme: {
                    color: '#F37254'
                },
                handler: verifyPremiumUser
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong");
        }
    }

    return isUserPremium ? "You're are already a premium user" : (
        <div
            className="min-h-screen bg-cover bg-center relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80')",
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            <div className="relative z-10 p-6">
                <h1 className="text-4xl font-bold text-center text-white mb-12">Choose Your Membership</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`card shadow-xl ${plan.bg} backdrop-blur-md border border-white/20 text-white`}
                        >
                            <div className="card-body">
                                <h2 className="card-title text-2xl justify-center">{plan.name}</h2>
                                <p className="text-center text-lg font-semibold mt-2">{plan.price}</p>

                                <ul className="mt-4 space-y-2 text-center">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>✅ {feature}</li>
                                    ))}
                                </ul>

                                <div className="card-actions justify-center mt-6">
                                    <button className={`btn ${plan.buttonColor} w-full`} onClick={() => handleBuy(plan.p_name)}>Buy Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Premium