import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import schLogo from "/logo.jpg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://juassevote-api.onrender.com/api/admins/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Success: Navigate to admin dashboard
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header Section with School Badge */}
      <div className="text-center mb-8">
        <img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-32 h-32 mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
          JUASS EVoting - Admin Login
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-2">
          Enter your credentials to access the admin panel
        </p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLogin;
