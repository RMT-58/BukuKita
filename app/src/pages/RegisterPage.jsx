import React, { useState } from "react";
import logo from "../assets/logo.png";
import { gql, useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router";
import { Toaster, toast } from "react-hot-toast";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      localStorage.setItem("access_token", data.register.token);
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed!");
      console.log(error);
    },
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      await register({
        variables: {
          input: {
            name,
            username,
            phone_number: phoneNumber,
            address,
            password,
          },
        },
      });
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white pb-12">
      <Toaster />
      <div className="w-full h-64 bg-blue-500 flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <img src={logo} alt="Burung Hantu" />
        </div>
      </div>

      <div className="w-full max-w-md px-6 py-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-6">BukuKita</h1>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <textarea
              id="address"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
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
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
