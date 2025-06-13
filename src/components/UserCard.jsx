import React from 'react'

function UserCard({ user }) {
    const { firstName, lastName, profilePic, age, about, gender } = user;
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
                    <button className="btn btn-error">Ignore</button>
                    <button className="btn btn-primary">Interested</button>
                </div>
            </div>
        </div>
    )
}

export default UserCard