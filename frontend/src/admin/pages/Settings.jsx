import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "@mui/icons-material";
import schLogo from "/logo.jpg";

const Settings = () => {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [votersAuthKey, setVotersAuthKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchSettings = async () => {
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

        if (data.settings) {
          setStartDateTime(
            new Date(data.settings.startDateTime).toISOString().slice(0, 16)
          );
          setEndDateTime(
            new Date(data.settings.endDateTime).toISOString().slice(0, 16)
          );
          setVotersAuthKey(data.settings.votersAuthKey);
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(""), 3000);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSettings();
  }, [BACKEND_URL]);

  const handleSaveSettings = async () => {
    if (!startDateTime || !endDateTime || !votersAuthKey) {
      setError("All fields are required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDateTime, endDateTime, votersAuthKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSuccess(data.message || "Settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.div
        className="w-full md:w-72 bg-violet-900 text-white p-6 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-28 h-28 mb-6 object-contain rounded-full shadow-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        />
        <motion.h1
          className="text-3xl font-extrabold tracking-tight"
          variants={itemVariants}
        >
          JUASS EVoting
        </motion.h1>
        <motion.p
          className="text-sm mt-2 text-gray-200"
          variants={itemVariants}
        >
          Settings
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-orange-50 via-white to-violet-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight mb-6"
          variants={itemVariants}
        >
          Voting Settings
        </motion.h1>

        {fetchLoading && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            Loading settings...
          </motion.div>
        )}
        {error && (
          <motion.div
            className="text-center p-4 text-red-600 bg-red-50 rounded-lg max-w-lg mx-auto mb-6"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="text-center p-4 text-green-600 bg-green-50 rounded-lg max-w-lg mx-auto mb-6"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {success}
          </motion.div>
        )}

        {!fetchLoading && (
          <motion.div
            className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mx-auto"
            variants={itemVariants}
          >
            <div className="mb-4">
              <label
                htmlFor="startDateTime"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startDateTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="endDateTime"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="votersAuthKey"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Voters Auth Key
              </label>
              <input
                type="text"
                id="votersAuthKey"
                placeholder="Enter voters authentication key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={votersAuthKey}
                onChange={(e) => setVotersAuthKey(e.target.value)}
                disabled={loading}
              />
            </div>
            <motion.button
              onClick={handleSaveSettings}
              className={`w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-violet-700 transition duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={loading}
            >
              <Save />
              {loading ? "Saving..." : "Save Settings"}
            </motion.button>
          </motion.div>
        )}

        <motion.footer
          className="mt-12 text-gray-600 text-sm sm:text-base text-center"
          variants={itemVariants}
        >
          &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Settings;
