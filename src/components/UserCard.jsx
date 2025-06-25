import React, { useState } from 'react'
import { removeUserFromFeed } from '../utils/feedSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

function UserCard({ user }) {
    const [error, setError] = useState("");
    const dispatch = useDispatch();


    const handleSendRequest = async (status, userId) => {
        try {
            const handleRqst = await axios.post(BASE_URL + '/request/send/' + status + "/" + userId, {}, { withCredentials: true });
            dispatch(removeUserFromFeed(userId))

        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong");
        }
    }

    const { _id,firstName, lastName, profilePic, age, about, gender } = user;
    return (
        <div className="card bg-base-300 w-96 shadow-sm">
            <figure>
                <img
                    src={profilePic}
                    alt={firstName} />
            </figure>
            <div className="card-body flex justify-center">
                <h2 className="card-title flex justify-center">{firstName + ' ' + lastName}</h2>
                {age && gender && <p className='flex justify-center'>{age + '     ' + gender}</p>}
                {about && <p>{about}</p>}
                <div className="card-actions justify-center my-4">
                    <button className="btn btn-error" onClick={() => handleSendRequest("Ignore", _id)} >Ignore</button>
                    <button className="btn btn-primary" onClick={() => handleSendRequest("Interested", _id)}>Interested</button>
                </div>
            </div>
        </div>
    )
}

export default UserCard