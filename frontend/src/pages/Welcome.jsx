import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import schLogo from "/logo.jpg";

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [votersAuthKey, setVotersAuthKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  const handleStudentClick = async () => {
    setShowModal(true);
    setError("");
    setVotersAuthKey("");
  };

  const handleModalSubmit = async () => {
    if (!votersAuthKey.trim()) {
      setError("Please enter the voters authentication key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch settings");
      }

      if (!data.settings || !data.settings.votersAuthKey) {
        throw new Error("No voters authentication key found");
      }

      if (votersAuthKey === data.settings.votersAuthKey) {
        setShowModal(false);
        navigate("/student-login");
      } else {
        setError("Invalid voters authentication key");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setVotersAuthKey("");
    setError("");
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-violet-50 flex flex-col items-center justify-center p-4 sm:p-8"
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
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-orange-900 tracking-tight"
          variants={itemVariants}
        >
          Welcome to JUASS EVoting
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-700 mt-3 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Juaben Senior High School Electronic Voting Platform
        </motion.p>
      </motion.div>

      {/* Hero Image */}
      <motion.div className="w-full max-w-3xl mb-10" variants={itemVariants}>
        <img
          src="https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="JUASS Voting Banner"
          className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-xl"
        />
      </motion.div>

      {/* Call to Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-6"
        variants={itemVariants}
      >
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Link
            to="/admin-login"
            className="flex items-center justify-center gap-2 bg-orange-700 text-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-orange-800 transition duration-300 shadow-md"
          >
            <span>I am an Admin</span>
          </Link>
        </motion.div>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <button
            onClick={handleStudentClick}
            className="flex items-center justify-center gap-2 bg-violet-700 text-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-violet-800 transition duration-300 shadow-md"
          >
            <span>I am a Student</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Voters Auth Key Modal */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          onClick={handleModalClose}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <h2 className="text-2xl font-bold text-violet-900 mb-4">
              Enter Voters Authentication Key
            </h2>
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="votersAuthKey"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Authentication Key
              </label>
              <input
                type="text"
                id="votersAuthKey"
                placeholder="Enter the voters auth key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={votersAuthKey}
                onChange={(e) => setVotersAuthKey(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleModalSubmit}
                className={`flex-1 bg-violet-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-violet-700 transition duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Submit"}
              </button>
              <button
                onClick={handleModalClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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

export default Welcome;
