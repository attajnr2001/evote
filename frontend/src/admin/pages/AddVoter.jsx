import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PersonAdd, Person, UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import schLogo from "/logo.jpg";

const AddVoter = () => {
  const [formData, setFormData] = useState({
    name: "",
    indexNumber: "",
    class: "",
    year: "",
  });
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/admins/add-voter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add voter");
      }

      // Refresh student list
      const updatedResponse = await fetch(
        `${BACKEND_URL}/api/admins/students`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedData = await updatedResponse.json();

      if (!updatedResponse.ok) {
        throw new Error(updatedData.message || "Failed to refresh students");
      }

      setStudents(updatedData);
      setSuccess("Voter added successfully!");
      setFormData({ name: "", indexNumber: "", class: "", year: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file); // Append the file to FormData with field name "file"

      const response = await fetch(`${BACKEND_URL}/api/admins/add-voters`, {
        method: "POST",
        body: formData, // Send FormData instead of JSON
        // Do NOT set Content-Type header; browser will set multipart/form-data automatically
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add voters");
      }

      // Refresh student list
      const updatedResponse = await fetch(
        `${BACKEND_URL}/api/admins/students`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedData = await updatedResponse.json();

      if (!updatedResponse.ok) {
        throw new Error(updatedData.message || "Failed to refresh students");
      }

      setStudents(updatedData);
      setSuccess(
        `Bulk upload completed: ${result.addedCount} voters added, ` +
          `${result.skippedCount} skipped.` +
          (result.errors ? ` Errors: ${result.errors.join("; ")}` : "")
      );
      setTimeout(() => setSuccess(""), 5000);
      e.target.value = ""; // Reset file input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
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
          Add Voter
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
          className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight mb-6 flex items-center gap-2"
          variants={itemVariants}
        >
          <Person />
          Add New Voter
        </motion.h1>

        {/* Loading or Error State */}

        {error && (
          <motion.div
            className="mb-4 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg max-w-lg mx-auto"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="mb-4 text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg max-w-lg mx-auto"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {success}
          </motion.div>
        )}

        {/* Form and File Upload */}

        <motion.div
          className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg mb-12"
          variants={itemVariants}
        >
          {/* Single Voter Form */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add Single Voter
          </h2>
          <form onSubmit={handleSubmit}>
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
                placeholder="Enter student name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="indexNumber"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Index Number
              </label>
              <input
                type="text"
                id="indexNumber"
                name="indexNumber"
                placeholder="Enter index number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.indexNumber}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="class"
                className="block text-gray-800 text-sm font-semibold mb-2"
              >
                Class
              </label>
              <input
                type="text"
                id="class"
                name="class"
                placeholder="Enter class (e.g., Form 1A)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
                value={formData.class}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
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
            <motion.button
              type="submit"
              className={`w-full bg-violet-700 text-white py-3 px-4 rounded-full font-semibold text-lg hover:bg-violet-800 transition duration-300 shadow-md disabled:bg-violet-400 flex items-center justify-center gap-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <PersonAdd />
              {loading ? "Adding Voter..." : "Add Voter"}
            </motion.button>
          </form>

          {/* Bulk Upload Section */}
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
            Upload Voters from Excel
          </h2>
          <div className="mb-5">
            <label
              htmlFor="fileUpload"
              className="block text-gray-800 text-sm font-semibold mb-2"
            >
              Upload Excel File
            </label>
            <input
              type="file"
              id="fileUpload"
              accept=".xlsx, .xls"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <p className="text-gray-600 text-sm mt-2">
              Excel file should have columns: name, indexNumber, class, year
            </p>
          </div>
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

export default AddVoter;
