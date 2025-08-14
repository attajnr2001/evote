import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import schLogo from "/logo.jpg";

const positions = [
  "Head Boy",
  "Head Girl",
  "Compound Overseer Boy",
  "Compound Overseer Girl",
  "Dining Hall Boy",
  "Dining Hall Girl",
  "Entertainment Prefect Boy",
  "Entertainment Prefect Girl",
  "Library Prefect Boy",
  "Library Prefect Girl",
  "Prep Prefect Boy",
  "Prep Prefect Girl",
  "Utility Prefect Boy",
  "Utility Prefect Girl",
  "Sports Prefect Boy",
  "Sports Prefect Girl",
];

const Vote = () => {
  const [selections, setSelections] = useState({});
  const [candidates, setCandidates] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/students/candidates`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch candidates");
        }

        setCandidates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [BACKEND_URL]);

  const handleSelection = (position, candidateId) => {
    setSelections((prev) => ({ ...prev, [position]: candidateId }));
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Adjusted for header
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError("");

    try {
      const studentId = sessionStorage.getItem("studentId");
      if (!studentId) {
        throw new Error("Student ID not found. Please log in again.");
      }

      const response = await fetch(`${BACKEND_URL}/api/students/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, votes: selections }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit vote");
      }

      alert("Congratulations! Your vote has been submitted successfully.");
      sessionStorage.removeItem("studentId");
      navigate("/student-login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  // Filter positions to only those with candidates, preserving order
  const validPositions = positions.filter(
    (position) => candidates[position]?.length > 0
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
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

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
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

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-violet-50">
      {/* Header */}
      <motion.div
        className="text-center py-8 bg-violet-900 text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-28 h-28 mx-auto mb-4 object-contain rounded-full shadow-lg"
          variants={itemVariants}
        />
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          variants={itemVariants}
        >
          JUASS EVoting - Cast Your Vote
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl mt-2 text-gray-200"
          variants={itemVariants}
        >
          Select one candidate per position
        </motion.p>
      </motion.div>

      {/* Error or Loading State */}
      {loading && (
        <motion.div
          className="text-center p-4 text-gray-600 max-w-lg mx-auto"
          variants={itemVariants}
        >
          Loading candidates...
        </motion.div>
      )}
      {error && (
        <motion.div
          className="text-center p-4 text-red-600 bg-red-50 rounded-lg max-w-lg mx-auto"
          variants={errorVariants}
          initial="hidden"
          animate="visible"
        >
          {error}
        </motion.div>
      )}

      {/* Voting Sections */}
      {!loading && !error && validPositions.length === 0 && (
        <motion.div
          className="text-center p-4 text-gray-600 max-w-lg mx-auto"
          variants={itemVariants}
        >
          No candidates available for voting.
        </motion.div>
      )}
      {!loading &&
        !error &&
        validPositions.map((position, index) => (
          <motion.section
            key={position}
            id={position.toLowerCase().replace(/\s+/g, "-")}
            className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-2xl md:text-3xl font-semibold text-violet-900 mb-8"
              variants={itemVariants}
            >
              {position}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
              {candidates[position].map((candidate) => (
                <motion.div
                  key={candidate.id}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={`${BACKEND_URL}${candidate.image}`}
                    alt={candidate.name}
                    className="w-48 h-48 object-cover rounded-lg mb-4 shadow-sm"
                    onError={(e) => {
                      console.error(
                        `Failed to load image for ${candidate.name}: ${BACKEND_URL}${candidate.image}`
                      );
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                  <p className="text-lg font-semibold text-gray-700 mb-4">
                    {candidate.name}
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={position}
                      value={candidate.id}
                      checked={selections[position] === candidate.id}
                      onChange={() => handleSelection(position, candidate.id)}
                      className="h-5 w-5 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-700 text-sm font-medium">
                      Select
                    </span>
                  </label>
                </motion.div>
              ))}
            </div>
            {index < validPositions.length - 1 ? (
              <motion.button
                onClick={() =>
                  scrollToSection(
                    validPositions[index + 1].toLowerCase().replace(/\s+/g, "-")
                  )
                }
                className="mt-8 bg-violet-700 text-white py-3 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-violet-800 transition duration-300 shadow-md"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Next: {validPositions[index + 1]}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                className="mt-8 bg-violet-700 text-white py-3 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-violet-800 transition duration-300 shadow-md"
                disabled={loading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {loading ? "Submitting..." : "Submit Vote"}
              </motion.button>
            )}
          </motion.section>
        ))}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Your Votes
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your votes? Once submitted, your
              votes cannot be changed.
            </p>
            <div className="flex justify-end gap-4">
              <motion.button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                className="bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition duration-300"
                disabled={loading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer Section */}
      <motion.footer
        className="text-center py-8 text-gray-600 text-sm"
        variants={itemVariants}
      >
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </motion.footer>
    </div>
  );
};

export default Vote;
