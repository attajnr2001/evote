import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logout, PieChart } from "@mui/icons-material";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import schLogo from "/logo.jpg";

const Turnout = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    voted: 0,
    notVoted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admins/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch stats");
      }

      setStats({
        totalVoters: data.totalVoters,
        voted: data.voted,
        notVoted: data.notVoted,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  // Data for the pie chart
  const chartData = [
    { name: "Voted", value: stats.voted, color: "#16a34a" }, // violet
    { name: "Not Voted", value: stats.notVoted, color: "#dc2626" }, // Red
  ];

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

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
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
          Voter Turnout
        </motion.p>
        <motion.button
          onClick={handleLogout}
          className="mt-8 bg-red-700 text-white py-2 px-6 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-red-800 transition duration-300 shadow-md"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Logout fontSize="small" />
          Logout
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-orange-50 via-white to-violet-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight mb-6 flex items-center gap-2"
          variants={itemVariants}
        >
          <PieChart />
          Voter Turnout
        </motion.h1>

        {/* Chart Section */}
        <motion.div className="mb-10" variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Voting Turnout Statistics
          </h2>
          {loading && (
            <motion.p
              className="text-gray-600 text-center"
              variants={itemVariants}
            >
              Loading stats...
            </motion.p>
          )}
          {error && (
            <motion.p
              className="text-red-600 mb-4 bg-red-50 p-3 rounded-lg text-center max-w-lg mx-auto"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
            >
              {error}
            </motion.p>
          )}
          {!loading && !error && (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
            >
              <ResponsiveContainer width="100%" height={400}>
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </motion.div>

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

export default Turnout;
