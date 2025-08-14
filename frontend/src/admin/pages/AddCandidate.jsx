import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PersonAdd } from "@mui/icons-material";
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

const AddCandidate = () => {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    position: "",
    year: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("idNumber", formData.idNumber);
    data.append("name", formData.name);
    data.append("position", formData.position);
    data.append("year", formData.year);
    if (image) {
      data.append("image", image);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admins/add-candidate`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add candidate");
      }

      alert("Candidate added successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const imageVariants = {
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
          Add Candidate
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-white to-violet-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight mb-6"
          variants={itemVariants}
        >
          Add New Candidate
        </motion.h1>

        {/* Form */}
        <motion.div
          className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg"
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
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="idNumber"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Student ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                placeholder="Enter student ID number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.idNumber}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter candidate name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="position"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Position
              </label>
              <select
                id="position"
                name="position"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.position}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select a position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label
                htmlFor="year"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Year
              </label>
              <input
                type="text"
                id="year"
                name="year"
                placeholder="Enter year (e.g., 2025)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.year}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="image"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Candidate Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/png"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                onChange={handleImageChange}
                disabled={loading}
                required
              />
            </div>
            {imagePreview && (
              <motion.div
                className="mb-6 flex justify-center"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <img
                  src={imagePreview}
                  alt="Candidate Preview"
                  className="w-64 h-64 object-cover rounded-xl shadow-lg"
                />
              </motion.div>
            )}
            <motion.button
              type="submit"
              className="w-full bg-violet-700 text-white py-3 px-4 rounded-full font-semibold text-lg hover:bg-violet-800 transition duration-300 shadow-md disabled:bg-violet-400 flex items-center justify-center gap-2"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <PersonAdd />
              {loading ? "Adding Candidate..." : "Add Candidate"}
            </motion.button>
          </form>
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

export default AddCandidate;
