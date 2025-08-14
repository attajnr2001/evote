import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart } from "@mui/icons-material";
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

const ViewResults = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admins/results`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch results");
        }

        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [BACKEND_URL]);

  // Filter positions to only those with candidates
  const validPositions = positions.filter(
    (position) => results[position]?.length > 0
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
          View Results
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
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight flex items-center gap-2 mb-6"
          variants={itemVariants}
        >
          <BarChart />
          Election Results
        </motion.h1>

        {/* Error or Loading State */}
        {loading && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            Loading results...
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

        {/* Results Sections */}
        {!loading && !error && validPositions.length === 0 && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            No results available.
          </motion.div>
        )}
        {!loading &&
          !error &&
          validPositions.map((position) => {
            const totalVotes = results[position].reduce(
              (sum, candidate) => sum + candidate.votes,
              0
            );
            return (
              <motion.section
                key={position}
                className="mb-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h2
                  className="text-2xl font-semibold text-gray-700 mb-4"
                  variants={itemVariants}
                >
                  {position}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {results[position]
                    .sort((a, b) => b.votes - a.votes) // Sort by votes descending
                    .map((candidate) => {
                      const percentage =
                        totalVotes > 0
                          ? ((candidate.votes / totalVotes) * 100).toFixed(1)
                          : 0;
                      return (
                        <motion.div
                          key={candidate.id}
                          className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={`${BACKEND_URL}${candidate.image}`}
                            alt={candidate.name}
                            className="w-64 h-64 object-cover rounded-lg mb-4 shadow-sm"
                            onError={(e) => {
                              console.error(
                                `Failed to load image for ${candidate.name}: ${BACKEND_URL}${candidate.image}`
                              );
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                          <p className="text-lg font-semibold text-gray-700 mb-2">
                            {candidate.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Votes:{" "}
                            <span className="font-bold text-violet-600">
                              {candidate.votes} ({percentage}%)
                            </span>
                          </p>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.section>
            );
          })}

        {/* Footer */}
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

export default ViewResults;
