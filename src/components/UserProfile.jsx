import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';

function UserProfile() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);

    const handleSendRequest = async (status, userId) => {
        try {
            await axios.post(`${BASE_URL}/request/send/${status}/${userId}`, {}, { withCredentials: true });
        } catch (err) {
            if (err?.response?.status === 401) navigate("/login");
            setError(err?.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/auth/user/${userId}`, {
                    withCredentials: true,
                });
                setUser(res.data.data);
            } catch (err) {
                console.error('Failed to fetch user profile', err);
            }
        };

        fetchUser();
    }, [userId]);

    if (!user) return <div className="text-center mt-20">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-base-100 p-6 mt-10 rounded-lg shadow">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left - Image */}
                <div className="w-full md:w-1/3">
                    <img
                        src={user.profilePic}
                        alt={user.firstName}
                        className="w-full rounded-lg object-cover"
                    />
                </div>

                {/* Right - Details */}
                <div className="w-full md:w-2/3 space-y-2">
                    <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                    {user.age && <p><strong>Age:</strong> {user.age}</p>}
                    {user.gender && <p><strong>Gender:</strong> {user.gender}</p>}
                    <p><strong>Email:</strong> {user.email}</p>

                    {user.about && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-1">About</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{user.about}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-10 flex justify-center gap-2">
                <button className="btn btn-error btn-sm" onClick={() => handleSendRequest("Ignore", userId)}>Ignore</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleSendRequest("Interested", userId)}>Interested</button>
            </div>
        </div>
    );
}

export default UserProfile;
