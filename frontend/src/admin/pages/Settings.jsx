import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Add, Delete } from "@mui/icons-material";
import schLogo from "/logo.jpg";

const Settings = () => {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [votersAuthKey, setVotersAuthKey] = useState("");
  const [newPosition, setNewPosition] = useState(""); // New state for position input
  const [positions, setPositions] = useState([]); // State for list of positions
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchSettingsAndPositions = async () => {
      try {
        // Fetch settings
        const settingsResponse = await fetch(`${BACKEND_URL}/api/settings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const settingsData = await settingsResponse.json();
        if (!settingsResponse.ok) {
          throw new Error(settingsData.message || "Failed to fetch settings");
        }

        if (settingsData.settings) {
          setStartDateTime(
            new Date(settingsData.settings.startDateTime)
              .toISOString()
              .slice(0, 16)
          );
          setEndDateTime(
            new Date(settingsData.settings.endDateTime)
              .toISOString()
              .slice(0, 16)
          );
          setVotersAuthKey(settingsData.settings.votersAuthKey);
        }

        // Fetch positions
        const positionsResponse = await fetch(
          `${BACKEND_URL}/api/admins/positions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const positionsData = await positionsResponse.json();
        if (!positionsResponse.ok) {
          throw new Error(positionsData.message || "Failed to fetch positions");
        }

        setPositions(positionsData);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(""), 3000);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSettingsAndPositions();
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

  const handleAddPosition = async () => {
    if (!newPosition) {
      setError("Position name is required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/admins/add-position`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPosition }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add position");
      }

      setPositions([
        ...positions,
        { id: data.position._id, name: data.position.name },
      ]);
      setNewPosition("");
      setSuccess("Position added successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async (positionId) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admins/delete-position`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ positionId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete position");
      }

      setPositions(positions.filter((pos) => pos.id !== positionId));
      setSuccess("Position deleted successfully");
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
          <>
            {/* Voting Settings Section */}
            <motion.div
              className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mx-auto mb-8"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Voting Period
              </h2>
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

            {/* Manage Positions Section */}
            <motion.div
              className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mx-auto"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Manage Positions
              </h2>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter new position"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  disabled={loading}
                />
                <motion.button
                  onClick={handleAddPosition}
                  className={`bg-green-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition duration-300 shadow-md ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={loading}
                >
                  <Add />
                  Add
                </motion.button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {positions.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    No positions available
                  </p>
                ) : (
                  positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex justify-between items-center py-2 border-b border-gray-200"
                    >
                      <span className="text-gray-800">{position.name}</span>
                      <motion.button
                        onClick={() => handleDeletePosition(position.id)}
                        className={`bg-red-600 text-white py-1 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition duration-300 ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={loading}
                      >
                        <Delete />
                        Delete
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
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
