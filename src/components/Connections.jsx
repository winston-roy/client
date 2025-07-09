import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addConnection } from '../utils/connectionSlice';
import { Link, useNavigate } from 'react-router-dom';

const Connections = () => {
    const connections = useSelector((store) => store.connections);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const fetchConnection = async () => {
        //if (connections) return;
        try {
            const data = await axios.get(BASE_URL + '/user/requests/connections', { withCredentials: true });
            dispatch(addConnection(data.data.data));
        } catch (err) {
            if (err.status === 401)
                navigate("/login");
            setError(err?.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        fetchConnection();
    }, []);

    if (error) return <h1 className="text-red-500 text-center mt-10">{error}</h1>;
    if (!connections) return null;
    if (connections.length === 0) return <h1 className="text-center mt-10">No Connections Found!!!</h1>;

    return (
        <div className="my-10 px-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-10 text-primary">Your Connections</h1>

            <div className="flex flex-col gap-8 items-center">
                {connections.map((connection) => {
                    const { _id, firstName, lastName, profilePic, gender, age, about } = connection;
                    return (
                        <div
                            key={_id}
                            className="card w-full max-w-md shadow-xl transition-transform hover:scale-[1.02] duration-200 bg-base-300"
                        >
                            <figure className="px-6 pt-6 flex justify-center">
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

                                <div className="card-actions mt-4">
                                    <button className="btn btn-primary">
                                        <Link to={'/chat/' + _id}>💬 Chat</Link>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default Connections;
