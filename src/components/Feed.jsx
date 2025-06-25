import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';

function Feed() {
  const [error, setError] = useState("");
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    //if (feed) return;

    try {
      const connections = await axios.get(BASE_URL + '/user/requests/feed?page=1&limit=10', { withCredentials: true })
      dispatch(addFeed(connections.data['data']));
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || "Something went wrong");
    }

  }

  useEffect(() => {
    getFeed();
  }, [])

  if (error) return <h1 className="text-red-500 text-center mt-10">{error}</h1>;
  if (!feed) return null;
  if (feed.length === 0) return <h1 className="text-center mt-10">No New Users Found!!!</h1>;

  return (

    feed && (
      <div className='flex justify-center my-10'>
        <UserCard user={feed[0]}></UserCard>
      </div>
    )
  )
}

export default Feed