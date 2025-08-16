import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Person, PictureAsPdf, Refresh } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import schLogo from "/logo.jpg";

const ViewVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortVoted, setSortVoted] = useState(null); // null, true, or false
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admins/students`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch voters");
        }

        setVoters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, [BACKEND_URL]);

  const handleResetVotes = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all voter statuses? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admins/reset-votes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset voter statuses");
      }

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
        throw new Error(updatedData.message || "Failed to refresh voters");
      }

      setVoters(updatedData);
      alert("All voter statuses reset successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text("JUASS EVoting - Voter List", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Voters: ${voters.length}`, 14, 38);

    const tableHeaders = ["Index Number", "Name", "Class", "Year", "Has Voted"];
    const tableData = sortedVoters.map((voter) => [
      voter.indexNumber,
      voter.name,
      voter.class,
      voter.year,
      voter.hasVoted ? "Yes" : "No",
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 45 },
    });

    doc.save(`Voters_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleSortVoted = (value) => {
    setSortVoted(value);
  };

  const sortedVoters = [...voters].sort((a, b) => {
    if (sortVoted === null) return a.name.localeCompare(b.name);
    return sortVoted ? b.hasVoted - a.hasVoted : a.hasVoted - b.hasVoted;
  });

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

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
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
          View Voters
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-orange-50 via-white to-violet-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight flex items-center gap-2"
            variants={itemVariants}
          >
            <Person />
            Voter List
          </motion.h1>
          <div className="flex gap-4">
            <motion.button
              onClick={handleExportPDF}
              className="bg-violet-700 text-white py-2 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-violet-800 transition duration-300 shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <PictureAsPdf />
              Export to PDF
            </motion.button>
            <motion.button
              onClick={handleResetVotes}
              className="bg-red-700 text-white py-2 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-red-800 transition duration-300 shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Refresh />
              Reset All Votes
            </motion.button>
            <motion.select
              onChange={(e) =>
                handleSortVoted(
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
              className="bg-violet-700 text-white py-2 px-4 rounded-full font-semibold hover:bg-violet-800 transition duration-300 shadow-md"
              variants={buttonVariants}
              whileHover="hover"
            >
              <option value="">Sort by Name</option>
              <option value="true">Voted</option>
              <option value="false">Not Voted</option>
            </motion.select>
          </div>
        </div>

        {loading && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            Loading voters...
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

        {!loading && !error && voters.length === 0 && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            No voters available.
          </motion.div>
        )}
        {!loading && !error && voters.length > 0 && (
          <motion.div
            className="overflow-x-auto rounded-xl shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <table className="min-w-full bg-white rounded-xl border border-gray-200">
              <thead className="sticky top-0 bg-violet-700 text-white z-10">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[120px]">
                    Index Number
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[200px]">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[150px]">
                    Class
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[100px]">
                    Year
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[100px]">
                    Has Voted
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVoters.map((voter, index) => (
                  <motion.tr
                    key={voter.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {voter.indexNumber}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {voter.name}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {voter.class}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {voter.year}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {voter.hasVoted ? "Yes" : "No"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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

export default ViewVoters;
