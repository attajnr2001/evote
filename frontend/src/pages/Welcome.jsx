import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import schLogo from "/logo.jpg";

const Welcome = () => {
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
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-900 tracking-tight"
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
            className="flex items-center justify-center gap-2 bg-blue-700 text-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-blue-800 transition duration-300 shadow-md"
          >
            <span>I am an Admin</span>
          </Link>
        </motion.div>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Link
            to="/student-login"
            className="flex items-center justify-center gap-2 bg-green-700 text-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-green-800 transition duration-300 shadow-md"
          >
            <span>I am a Student</span>
          </Link>
        </motion.div>
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

export default Welcome;
