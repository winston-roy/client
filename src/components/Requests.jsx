import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BASE_URL } from '../utils/constants';
import { addRequest, removeRequest  } from '../utils/requestSlice';
import { useNavigate } from 'react-router-dom';

function Requests() {
    const requests = useSelector((store) => store.Requests);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [error, setError] = useState("");

    const reviewRequest = async (status, requestId) => {
        try {
            const reviewRqst = await axios.post(BASE_URL + '/request/review/' + status + "/" + requestId, {}, { withCredentials: true });
            dispatch(removeRequest(requestId))
        } catch (err) {
            if (err.status === 401)
                navigate("/login");
            setError(err?.response?.data?.message || "Something went wrong");
        }
    }

    const fetchRequests = async () => {
        if (requests) return;

        try {
            const data = await axios.get(BASE_URL + '/user/requests/received', { withCredentials: true });
            dispatch(addRequest(data.data.data))
        } catch (err) {
            if (err.status === 401)
                navigate("/login");
            setError(err?.response?.data?.message || "Something went wrong");
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    if (error) return <h1 className="text-red-500 text-center mt-10">{error}</h1>;
    if (!requests) return null;
    if (requests.length === 0) return <h1 className="text-center mt-10">No Requests Found!!!</h1>;


    return (
        <div className="my-10 px-4 max-w-7xl mx-auto pb-10">
            <h1 className="text-4xl font-bold text-center mb-10 text-primary">Connection Requests</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {requests.map((request) => {
                    const { _id, firstName, lastName, profilePic, gender, age, about } = request.fromUserId;
                    return (
                        <div
                            key={_id}
                            className="card shadow-xl transition-transform hover:scale-105 duration-200 bg-base-300"
                        >
                            <figure className="px-6 pt-6">
                                <img
                                    src={profilePic || "http://dummyimage.com/200x200"}
                                    alt={`${firstName} ${lastName}`}
                                    className="rounded-xl h-40 w-40 object-cover"
                                />
                            </figure>
                            <div className="card-body items-center text-center px-6">
                                <h2 className="card-title text-lg font-semibold">{firstName} {lastName}</h2>
                                <p className="text-sm text-gray-500">{age} years old | {gender}</p>
                                {about && <p className="mt-2 text-sm italic text-gray-600">{about}</p>}
                            </div>
                            <div className="card-actions justify-center my-4">
                                <button className="btn btn-error" onClick={() => reviewRequest("Rejected",request._id)}>Reject</button>
                                <button className="btn btn-primary" onClick={() => reviewRequest("Accepted", request._id)}>Accept</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    );
}

export default Requests