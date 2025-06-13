import axios from 'axios'
import React, { useEffect } from 'react'
import { BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';

function Feed() {

  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    if (feed) return;

    try {
      const connections = await axios.get(BASE_URL + '/user/requests/feed', { withCredentials: true })
      dispatch(addFeed(connections.data['data']));
    } catch (err) {
      console.error(err)
    }

  }

  useEffect(() => {
    getFeed();
  }, [])
  return (
    feed && (
      <div className='flex justify-center my-10'>
        <UserCard user={feed[0]}></UserCard>
      </div>
    )
  )
}

export default Feed