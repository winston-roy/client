import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';
//import { ChevronLeft, ChevronRight } from 'lucide-react';

function Feed() {
  const [error, setError] = useState("");
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const getFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + '/user/requests/feed?page=1&limit=10', { withCredentials: true });
      dispatch(addFeed(res.data.data));
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) navigate("/login");
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (error) return <h1 className="text-red-500 text-center mt-10">{error}</h1>;
  if (!feed) return null;
  if (feed.length === 0) return <h1 className="text-center mt-10">No New Users Found!!!</h1>;

  return (
    <div className="px-4">
      {/* Main UserCard */}
      <div className="flex justify-center mt-10">
        <UserCard user={feed[0]} />
      </div>

      {/* Other UserCards as scrollable carousel */}
      {feed.length > 1 && (
        <>
          <div className='flex justify-center'>
            <h2 className="w-72 text-xl font-semibold mt-12 mb-4 text-center text-gray-700">Other Recommendations</h2>
          </div>
          
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              aria-label="Previous"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div
              className="flex overflow-x-auto gap-4 py-2 px-10 scroll-smooth no-scrollbar"
              ref={carouselRef}
            >
              {feed.slice(1).map((user, index) => (
                <div key={index} className="min-w-[280px] flex-shrink-0">
                  <UserCard user={user} />
                </div>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              aria-label="Next"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Feed;