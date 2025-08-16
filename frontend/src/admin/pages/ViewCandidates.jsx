import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Person,
  Delete,
  PictureAsPdf,
  Edit,
  Refresh,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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
  const [selectedImage, setSelectedImage] = useState(null); // State for enlarged image
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

  const handleResetVotes = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all candidate votes to zero? This action cannot be undone."
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
        throw new Error(data.message || "Failed to reset votes");
      }

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
      alert("All candidate votes reset successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text("JUASS EVoting - Candidate List", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(
      `Total Candidates: ${Object.values(candidates).flat().length}`,
      14,
      38
    );

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

    doc.save(`Candidates_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExportExcel = () => {
    const worksheetData = Object.keys(candidates)
      .sort((a, b) => positions.indexOf(a) - positions.indexOf(b))
      .flatMap((position) =>
        candidates[position].map((candidate) => ({
          "ID Number": candidate.idNumber || "-",
          Name: candidate.name,
          Position: candidate.position,
          Year: candidate.year || "-",
          Votes: candidate.votes,
        }))
      );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 15 }, // ID Number
      { wch: 20 }, // Name
      { wch: 20 }, // Position
      { wch: 10 }, // Year
      { wch: 10 }, // Votes
    ];

    XLSX.writeFile(
      workbook,
      `Candidates_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Handle image click to open modal
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const allCandidates = Object.keys(candidates)
    .sort((a, b) => positions.indexOf(a) - positions.indexOf(b))
    .flatMap((position) => candidates[position])
    .sort(
      (a, b) => positions.indexOf(a.position) - positions.indexOf(b.position)
    );

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
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
          View Candidates
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
            Candidate List
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
          </div>
        </div>

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
            className="overflow-x-auto rounded-xl shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <table className="min-w-full bg-white rounded-xl border border-gray-200">
              <thead className="sticky top-0 bg-violet-700 text-white z-10">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[80px]">
                    Image
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[150px]">
                    ID Number
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[200px]">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[200px]">
                    Position
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[100px]">
                    Year
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[100px]">
                    Votes
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCandidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="py-4 px-6 align-middle">
                      <img
                        src={`${BACKEND_URL}${candidate.image}`}
                        alt={candidate.name}
                        className="w-12 h-12 object-cover rounded-lg shadow-sm cursor-pointer"
                        onClick={() =>
                          handleImageClick(`${BACKEND_URL}${candidate.image}`)
                        }
                        onError={(e) => {
                          console.error(
                            `Failed to load image for ${candidate.name}: ${BACKEND_URL}${candidate.image}`
                          );
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {candidate.idNumber || "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {candidate.name}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {candidate.position}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {candidate.year || "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-800 align-middle text-sm">
                      {candidate.votes}
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() =>
                            navigate(`/admin/edit-candidate/${candidate.id}`)
                          }
                          className="text-orange-600 hover:text-orange-800"
                          title="Edit Candidate"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Edit fontSize="small" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(candidate.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Candidate"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Delete fontSize="small" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            onClick={handleCloseModal}
          >
            <div className="relative max-w-3xl w-full">
              <img
                src={selectedImage}
                alt="Enlarged candidate"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error(
                    `Failed to load enlarged image: ${selectedImage}`
                  );
                  e.target.src = "/placeholder.jpg";
                }}
              />
              <button
                className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-2 hover:bg-red-800"
                onClick={handleCloseModal}
                title="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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

export default ViewCandidates;
