import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import UserCard from './UserCard';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';

function EditProfile({ user }) {
    const dispatch = useDispatch();

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [age, setAge] = useState(user.age);
    const [profilePic, setProfilePic] = useState(user.profilePic);
    const [gender, setGender] = useState(user.gender);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [skills, setSkills] = useState(user.skills.join(', '));
    const [about, setAbout] = useState(user.about);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleSave = async () => {
        try {
            setError("");
            const updatedProfile = {
                firstName,
                lastName,
                age,
                phoneNumber,
                profilePic,
                gender,
                skills: skills.split(',').map(s => s.trim()),
                about,
            };

            const res = await axios.patch(`${BASE_URL}/auth/profile/${user._id}`, updatedProfile, {
                withCredentials: true,
            });

            dispatch(addUser(res.data.data));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-base-200 py-10 px-4 flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Edit Profile Form */}
            <div className="card w-full max-w-xl bg-base-100 shadow-xl p-6">
                <h2 className="text-3xl font-bold text-center mb-6">Edit Profile</h2>

                {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">First Name</span></label>
                    <input type="text" className="input input-bordered" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Last Name</span></label>
                    <input type="text" className="input input-bordered" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Age</span></label>
                    <input type="number" className="input input-bordered" value={age} onChange={e => setAge(e.target.value)} />
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Profile Pic URL</span></label>
                    <input type="text" className="input input-bordered" value={profilePic} onChange={e => setProfilePic(e.target.value)} />
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Gender</span></label>
                    <select className="select select-bordered" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Phone Number</span></label>
                    <input type="text" className="input input-bordered" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                </div>

                <div className="form-control mb-4">
                    <label className="label"><span className="label-text">Skills</span></label>
                    <input type="text" className="input input-bordered" placeholder="e.g. MEAN, Nodejs, Auth" value={skills} onChange={e => setSkills(e.target.value)} />
                </div>

                <div className="form-control mb-6">
                    <label className="label"><span className="label-text">About</span></label>
                    <textarea className="textarea textarea-bordered" rows="3" value={about} onChange={e => setAbout(e.target.value)}></textarea>
                </div>

                <div className="form-control flex justify-center">
                    <button className="btn btn-primary" onClick={handleSave}>Save</button>
                </div>
            </div>

            {/* Preview Card */}
            <div className="w-full max-w-sm flex justify-center align-middle">
                <UserCard user={{ firstName, lastName, profilePic, age, gender, about }} />
            </div>

            {/* Toast */}
            {showToast && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-success">
                        <span>Profile updated successfully.</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditProfile;
