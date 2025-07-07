import React, { useState } from "react";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from "../utils/userSlice";
import { useNavigate } from 'react-router-dom';
import { BASE_URL, SERVER } from '../utils/constants';

function Login() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoginFrom, setIsLoginForm] = useState(true);
  const [email, setEmailId] = useState(SERVER == 'LOCAL' ? 'winston@gmail.com' : '');
  const [password, setPassword] = useState(SERVER == 'LOCAL' ? 'Winston@123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(BASE_URL + '/auth/login', {
        email,
        password
      }, { withCredentials: true });

      dispatch(addUser(res.data.data));
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    try {
      setError('');
      const res = await axios.post(`${BASE_URL}/auth/signup`, {
        firstName,
        lastName,
        email,
        password,
      }, { withCredentials: true });
      dispatch(addUser(res.data.data));
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-base-200 overflow-hidden">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6"> {isLoginFrom ? "Login" : "Signup"}</h2>

          {!isLoginFrom && (
            <>
              <label className="form-control w-full max-w-xs my-2">
                <div className="label">
                  <span className="label-text">Firstname</span>
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
              <label className="form-control w-full max-w-xs my-2">
                <div className="label">
                  <span className="label-text">Lastname</span>
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
            </>
          )}
          {/* Email */}
          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Email</span></label>
            <input
              type="email"
              value={email}
              placeholder="email@example.com"
              className="input input-bordered"
              onChange={(e) => setEmailId(e.target.value)}
            />
          </div>

          {/* Password + Show Toggle */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                className="input input-bordered w-full"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>


          {/* Error Message */}
          {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}

          {/* Login Button */}
          <div className="form-control flex justify-center mt-6">
            <button className="btn btn-primary" onClick={isLoginFrom ? handleLogin : handleSignUp}>{isLoginFrom ? "Login" : "Signup"}</button>
          </div>
          <p
            className=" text-center cursor-pointer py-2"
            onClick={() => setIsLoginForm((value) => !value)}
          >
            {isLoginFrom
              ? "New user ? signup here"
              : "Existing User ? Login here"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
