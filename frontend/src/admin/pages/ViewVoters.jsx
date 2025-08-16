import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Person,
  PictureAsPdf,
  Refresh,
  Search,
  Description,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import schLogo from "/logo.jpg";

const ViewVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterVoted, setFilterVoted] = useState("all"); // "all", "voted", or "not-voted"
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
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
    doc.text(`Total Voters: ${filteredVoters.length}`, 14, 38);

    const tableHeaders = ["Index Number", "Name", "Class", "Year", "Has Voted"];
    const tableData = filteredVoters.map((voter) => [
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

  const handleExportExcel = () => {
    const worksheetData = filteredVoters.map((voter) => ({
      "Index Number": voter.indexNumber,
      Name: voter.name,
      Class: voter.class,
      Year: voter.year,
      "Has Voted": voter.hasVoted ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters");

    // Set column widths (optional, for better readability)
    worksheet["!cols"] = [
      { wch: 15 }, // Index Number
      { wch: 20 }, // Name
      { wch: 15 }, // Class
      { wch: 10 }, // Year
      { wch: 10 }, // Has Voted
    ];

    XLSX.write(
      workbook,
      `Voters_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleFilterVoted = (value) => {
    setFilterVoted(value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredVoters = voters
    .filter((voter) => {
      if (filterVoted === "all") return true;
      return filterVoted === "voted" ? voter.hasVoted : !voter.hasVoted;
    })
    .filter((voter) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        voter.name.toLowerCase().includes(query) ||
        voter.indexNumber.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-violet-900 tracking-tight flex items-center gap-2"
            variants={itemVariants}
          >
            <Person />
            Voter List
          </motion.h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.div
              className="relative w-full sm:w-64"
              variants={itemVariants}
            >
              <input
                type="text"
                placeholder="Search by name or index number"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition duration-200 pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </motion.div>
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
                onClick={handleExportExcel}
                className="bg-green-700 text-white py-2 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-green-800 transition duration-300 shadow-md"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Description />
                Export to Excel
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
                onChange={(e) => handleFilterVoted(e.target.value)}
                className="bg-violet-700 text-white py-2 px-4 rounded-full font-semibold hover:bg-violet-800 transition duration-300 shadow-md"
                variants={buttonVariants}
                whileHover="hover"
              >
                <option value="all">All Voters</option>
                <option value="voted">Voted</option>
                <option value="not-voted">Not Voted</option>
              </motion.select>
            </div>
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

        {!loading && !error && filteredVoters.length === 0 && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            No voters available.
          </motion.div>
        )}
        {!loading && !error && filteredVoters.length > 0 && (
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
                {filteredVoters.map((voter, index) => (
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
