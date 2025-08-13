import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Person, Delete, PictureAsPdf, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const ViewCandidates = () => {
  const [candidates, setCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admins/results`, {
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

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?"))
      return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admins/delete-candidate`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ candidateId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete candidate");
      }

      // Refresh candidates list
      const updatedResponse = await fetch(`${BACKEND_URL}/api/admins/results`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedData = await updatedResponse.json();

      if (!updatedResponse.ok) {
        throw new Error(updatedData.message || "Failed to refresh candidates");
      }

      setCandidates(updatedData);
      alert("Candidate deleted successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // Green color to match theme
    doc.text("JUASS EVoting - Candidate List", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(
      `Total Candidates: ${Object.values(candidates).flat().length}`,
      14,
      38
    );

    // Prepare table data
    const tableHeaders = ["ID Number", "Name", "Position", "Year", "Votes"];
    const tableData = Object.keys(candidates)
      .sort((a, b) => positions.indexOf(a) - positions.indexOf(b))
      .flatMap((position) =>
        candidates[position].map((candidate) => [
          candidate.idNumber || "-",
          candidate.name,
          candidate.position,
          candidate.year || "-",
          candidate.votes.toString(),
        ])
      );

    // Create table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [22, 163, 74], // Green header
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternating rows
      },
      margin: { top: 45 },
    });

    // Save PDF
    doc.save(`Candidates_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Flatten candidates for table and sort by position
  const allCandidates = Object.keys(candidates)
    .sort((a, b) => positions.indexOf(a) - positions.indexOf(b))
    .flatMap((position) => candidates[position])
    .sort(
      (a, b) => positions.indexOf(a.position) - positions.indexOf(b.position)
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const rowVariants = {
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
        className="w-full md:w-72 bg-green-900 text-white p-6 flex flex-col items-center"
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
          View Candidates
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-white to-green-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-green-900 tracking-tight flex items-center gap-2"
            variants={itemVariants}
          >
            <Person />
            Candidate List
          </motion.h1>
          <motion.button
            onClick={handleExportPDF}
            className="bg-green-700 text-white py-2 px-6 rounded-full font-semibold flex items-center gap-2 hover:bg-green-800 transition duration-300 shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <PictureAsPdf />
            Export to PDF
          </motion.button>
        </div>

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

        {/* Candidates Table */}
        {!loading && !error && allCandidates.length === 0 && (
          <motion.div
            className="text-center p-4 text-gray-600 max-w-lg mx-auto"
            variants={itemVariants}
          >
            No candidates available.
          </motion.div>
        )}
        {!loading && !error && allCandidates.length > 0 && (
          <motion.div
            className="overflow-x-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Image
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    ID Number
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Position
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Year
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Votes
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCandidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="py-4 px-6">
                      <img
                        src={`${BACKEND_URL}${candidate.image}`}
                        alt={candidate.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          console.error(
                            `Failed to load image for ${candidate.name}: ${BACKEND_URL}${candidate.image}`
                          );
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td className="py-4 px-6 text-gray-800">
                      {candidate.idNumber || "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-800">
                      {candidate.name}
                    </td>
                    <td className="py-4 px-6 text-gray-800">
                      {candidate.position}
                    </td>
                    <td className="py-4 px-6 text-gray-800">
                      {candidate.year || "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-800">
                      {candidate.votes}
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <motion.button
                        onClick={() =>
                          navigate(`/admin/edit-candidate/${candidate.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Candidate"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Edit />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(candidate.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Candidate"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Delete />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

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

export default ViewCandidates;
