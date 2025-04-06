import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        _id
        name
        username
        phone_number
        address
        created_at
        updated_at
      }
      token
    }
  }
`;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      localStorage.setItem("access_token", data.login.token);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed!");
      console.log(error);
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      await login({
        variables: {
          input: {
            username,
            password,
          },
        },
      });
    } catch (error) {
      console.log("error during logged in", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white pb-12">
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
              Username
            </label>
            <input
              id="username"
              type="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            className={`w-full text-white py-2 rounded-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
