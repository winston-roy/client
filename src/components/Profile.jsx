import React from 'react'
import EditProfile from './EditProfile'
import { BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'

function Profile() {
  const user = useSelector((store) => store.user);
  
  return (
    user && (
      <div className='flex justify-center my-10'>
        <EditProfile user={user}></EditProfile>
      </div>
    )
  )
}

export default Profile