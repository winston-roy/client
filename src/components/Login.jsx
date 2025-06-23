import React, { useState } from "react";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from "../utils/userSlice";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

function Login() {
  const [email, setEmailId] = useState("winston@gmail.com");
  const [password, setPassword] = useState("Winston@123");
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

  return (
    <div className="h-screen flex items-center justify-center bg-base-200 overflow-hidden">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">Login</h2>

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
          <div className="form-control mb-2">
            <label className="label"><span className="label-text">Password</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                className="input input-bordered w-full pr-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
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
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
          </div>

          {/* Sign Up */}
          <div className="text-center mt-4">
            <span className="text-sm">Don't have an account?</span>
            <button className="btn btn-link text-primary" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;










// import React, { useState } from "react";
// import axios from 'axios';
// import { useDispatch } from 'react-redux'
// import { addUser } from "../utils/userSlice";
// import { useNavigate } from 'react-router-dom';
// import {BASE_URL} from '../utils/constants';

// function Login() {
//   const [email, setEmailId] = useState("winston@gmail.com");
//   const [password, setPassword] = useState("Winston@123");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogin = async () => {

//     try {
//       const res = await axios.post(BASE_URL + '/auth/login', {
//         email,
//         password
//       }, { withCredentials: true });
//       dispatch(addUser(res.data['data']))
//       return navigate("/");
//     } catch (err) {
//       console.log(err)
//       setError(err?.response?.data?.message || "Something Went Wrong")
//     }
//   }

//   return (
//     <div className="h-screen flex items-center justify-center bg-base-200 overflow-hidden">
//       <div className="card w-96 bg-base-100 shadow-xl">
//         <div className="card-body">
//           <h2 className="card-title text-2xl justify-center mb-4">Login</h2>

//           <div className="form-control mb-3">
//             <label className="label">
//               <span className="label-text">Email</span>
//             </label>
//             <input
//               type="email"
//               value={email}
//               placeholder="email@example.com"
//               className="input input-bordered"
//               onChange={(e) => setEmailId(e.target.value)}
//             />
//           </div>

//           <div className="form-control mb-2">
//             <label className="label">
//               <span className="label-text">Password</span>
//             </label>
//             <input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               placeholder="••••••••"
//               className="input input-bordered"
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <label className="label cursor-pointer justify-start gap-2 mb-4">
//             <input
//               type="checkbox"
//               className="checkbox checkbox-sm"
//               checked={showPassword}
//               onChange={() => setShowPassword((prev) => !prev)}
//             />
//             <span className="label-text">Show Password</span>
//           </label>
//           <p className="text-red-500 flex justify-center">{error}</p>
//           <div className="form-control flex justify-center mt-4">
//             <button className="btn btn-primary" onClick={handleLogin}>Login</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;
