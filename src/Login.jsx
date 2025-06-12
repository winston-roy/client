import React, { useState } from "react";
import axios from 'axios';

function Login() {
  const [email, setEmailId] = useState("winston@gmail.com");
  const [password, setPassword] = useState("Winston@123");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:7777/api/v2/auth/login', {
        email,
        password
      })

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-base-200 overflow-hidden">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">Login</h2>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={email}
              placeholder="email@example.com"
              className="input input-bordered"
              onChange={(e) => setEmailId(e.target.value)}
            />
          </div>

          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="••••••••"
              className="input input-bordered"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label className="label cursor-pointer justify-start gap-2 mb-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
            />
            <span className="label-text">Show Password</span>
          </label>

          <div className="form-control flex justify-center mt-4">
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
