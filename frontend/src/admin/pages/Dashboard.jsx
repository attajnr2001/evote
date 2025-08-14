import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PersonAdd,
  HowToVote,
  BarChart,
  EmojiEvents,
  Logout,
  PieChart,
} from "@mui/icons-material";
import schLogo from "/logo.jpg";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    voted: 0,
    notVoted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

    fetchStats();
  }, [BACKEND_URL]);

  const cards = [
    {
      title: "Add Voter",
      icon: <PersonAdd className="text-violet-600" fontSize="large" />,
      route: "/admin/add-voter",
    },
    {
      title: "Add Candidate",
      icon: <HowToVote className="text-violet-600" fontSize="large" />,
      route: "/admin/add-candidate",
    },
    {
      title: "View Results",
      icon: <BarChart className="text-purple-600" fontSize="large" />,
      route: "/admin/view-results",
    },
    {
      title: "View Candidates",
      icon: <BarChart className="text-purple-600" fontSize="large" />,
      route: "/admin/view-candidates",
    },
    // {
    //   title: "View Winners",
    //   icon: <EmojiEvents className="text-yellow-600" fontSize="large" />,
    //   route: "/admin/view-winners",
    // },
    {
      title: "Show Turnout",
      icon: <PieChart className="text-orange-600" fontSize="large" />,
      route: "/admin/turnout",
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  // Calculate percentages
  const votedPercentage = stats.totalVoters
    ? ((stats.voted / stats.totalVoters) * 100).toFixed(1)
    : 0;
  const notVotedPercentage = stats.totalVoters
    ? ((stats.notVoted / stats.totalVoters) * 100).toFixed(1)
    : 0;

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
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
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
          Admin Dashboard
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
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight mb-6"
          variants={itemVariants}
        >
          Admin Dashboard
        </motion.h1>

        {/* Statistics Section */}
        <motion.div className="mb-10" variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Voting Statistics
          </h2>
          {loading && (
            <motion.p className="text-gray-600" variants={itemVariants}>
              Loading stats...
            </motion.p>
          )}
          {error && (
            <motion.p
              className="text-red-600 mb-4 bg-red-50 p-3 rounded-lg text-center"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
            >
              {error}
            </motion.p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Total Voters",
                  value: stats.totalVoters,
                  color: "text-violet-600",
                },
                {
                  title: "Voted",
                  value: stats.voted,
                  percentage: `${votedPercentage}%`,
                  color: "text-violet-600",
                },
                {
                  title: "Not Voted",
                  value: stats.notVoted,
                  percentage: `${notVotedPercentage}%`,
                  color: "text-red-600",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.title}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {stat.title}
                  </h3>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                    {stat.percentage && (
                      <span className="text-lg font-normal ml-2">
                        ({stat.percentage})
                      </span>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer flex flex-col items-center"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate(card.route)}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {card.title}
              </h3>
            </motion.div>
          ))}
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

export default Dashboard;
