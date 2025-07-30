import React, { useState } from 'react';
import { removeUserFromFeed } from '../utils/feedSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

function UserCard({ user }) {
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSendRequest = async (status, userId) => {
        try {
            await axios.post(`${BASE_URL}/request/send/${status}/${userId}`, {}, { withCredentials: true });
            dispatch(removeUserFromFeed(userId));
        } catch (err) {
            if (err?.response?.status === 401) navigate("/login");
            setError(err?.response?.data?.message || "Something went wrong");
        }
    };

    const { _id, firstName, lastName, profilePic, age, about, gender } = user;

    const handleViewProfile = () => {
        navigate(`/view/${_id}`);
    };

    

    return (
        <div className="card bg-base-300 w-72 h-[440px] shadow-md flex flex-col">
            <figure className="h-40 overflow-hidden">
                <img
                    src={profilePic}
                    alt={firstName}
                    className="w-full h-full object-cover"
                />
            </figure>

            <div className="card-body p-4 flex flex-col">
                <h2 className="card-title text-lg text-center flex justify-center ">{firstName + ' ' + lastName}</h2>

                {age && gender && (
                    <p className="text-center text-sm text-gray-600">
                        {age} • {gender}
                    </p>
                )}

                {about && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {about}
                    </p>
                )}

                {/* 🔍 View Profile Button */}
                <button
                    className="btn btn-outline btn-sm mt-4"
                    onClick={handleViewProfile}
                >
                    View Profile
                </button>

                <div className="mt-auto flex justify-center gap-2">
                    <button className="btn btn-error btn-sm" onClick={() => handleSendRequest("Ignore", _id)}>Ignore</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSendRequest("Interested", _id)}>Interested</button>
                </div>
            </div>
        </div>
    );
}

export default UserCard;



// import React, { useState } from 'react'
// import { removeUserFromFeed } from '../utils/feedSlice';
// import { useDispatch } from 'react-redux';
// import axios from 'axios';
// import { BASE_URL } from '../utils/constants';
// import { useNavigate } from 'react-router-dom';

// function UserCard({ user }) {
//     const [error, setError] = useState("");
//     const dispatch = useDispatch();
//     const navigate = useNavigate();


//     const handleSendRequest = async (status, userId) => {
//         try {
//             const handleRqst = await axios.post(BASE_URL + '/request/send/' + status + "/" + userId, {}, { withCredentials: true });
//             dispatch(removeUserFromFeed(userId))

//         } catch (err) {
//             if (err.status === 401)
//                 navigate("/login");
//             setError(err?.response?.data?.message || "Something went wrong");
//         }
//     }

//     const { _id, firstName, lastName, profilePic, age, about, gender } = user;
//     return (
//         <div className="card bg-base-300 w-96 shadow-sm">
//             <figure>
//                 <img
//                     src={profilePic}
//                     alt={firstName} />
//             </figure>
//             <div className="card-body flex justify-center">
//                 <h2 className="card-title flex justify-center">{firstName + ' ' + lastName}</h2>
//                 {age && gender && <p className='flex justify-center'>{age + '     ' + gender}</p>}
//                 {about && <p>{about}</p>}
//                 <div className="card-actions justify-center my-4">
//                     <button className="btn btn-error" onClick={() => handleSendRequest("Ignore", _id)} >Ignore</button>
//                     <button className="btn btn-primary" onClick={() => handleSendRequest("Interested", _id)}>Interested</button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default UserCard