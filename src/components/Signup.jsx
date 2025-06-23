import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            setError('');
            const res = await axios.post(`${BASE_URL}/auth/signup`, {
                firstName,
                lastName,
                email,
                password,
            });

            console.log('Signup Success:', res.data);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Sign Up</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">First Name</span></label>
                        <input type="text" className="input input-bordered" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text">Last Name</span></label>
                        <input type="text" className="input input-bordered" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>

                <div className="form-control mt-4 w-full">
                    <label className="label"><span className="label-text">Email</span></label>
                    <div className="relative">
                        <input type="email" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>

                <div className="form-control mt-4">
                    <label className="label"><span className="label-text">Password</span></label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <span
                            className="absolute top-3 right-4 text-sm cursor-pointer text-gray-500"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                <div className="form-control mt-6">
                    <button className="btn btn-primary w-full" onClick={handleSignup}>Sign Up</button>
                </div>

                <div className="text-center mt-4">
                    <span className="text-sm">Already have an account?</span>
                    <button className="btn btn-link text-primary text-sm" onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signup;
