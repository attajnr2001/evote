import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import schLogo from "/logo.jpg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/admins/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

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

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-4 sm:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section with School Badge */}
      <motion.div className="text-center mb-10" variants={itemVariants}>
        <motion.img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-40 h-40 mx-auto mb-6 object-contain rounded-full shadow-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        />
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-green-900 tracking-tight"
          variants={itemVariants}
        >
          JUASS EVoting - Admin Login
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-700 mt-3 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Enter your credentials to access the admin panel
        </motion.p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
        variants={itemVariants}
      >
        {error && (
          <motion.div
            className="mb-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-800 text-sm font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-800 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full bg-green-700 text-white py-3 px-4 rounded-full font-semibold text-lg hover:bg-green-800 transition duration-300 shadow-md disabled:bg-green-400"
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
      </motion.div>

      {/* Footer Section */}
      <motion.footer
        className="mt-12 text-gray-600 text-sm sm:text-base"
        variants={itemVariants}
      >
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </motion.footer>
    </motion.div>
  );
};

export default AdminLogin;
