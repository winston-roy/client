import NavBar from './NavBar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import { BASE_URL } from '../utils/constants'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux'
import { addUser } from "../utils/userSlice";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';




function Body() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + '/auth/profile', { withCredentials: true });
      dispatch(addUser(res.data['data']))
    } catch (err) {
      if (err.status === 401)
        navigate("/login");
      console.log('error---', err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Body