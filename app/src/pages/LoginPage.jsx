import React, { useState } from "react";
import { Upload } from "lucide-react";
import logo from "../assets/logo.png";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full h-64 bg-blue-500 flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <img src={logo} alt="Burung Hantu" />
        </div>
      </div>

      <div className="w-full max-w-md px-6 py-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-6">BukuKita</h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
