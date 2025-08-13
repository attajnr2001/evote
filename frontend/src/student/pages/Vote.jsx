import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const Vote = () => {
  const [selections, setSelections] = useState({});
  const [candidates, setCandidates] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/students/candidates`, {
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
  }, []);

  const handleSelection = (position, candidateId) => {
    setSelections((prev) => ({ ...prev, [position]: candidateId }));
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError("");

    try {
      const studentId = sessionStorage.getItem("studentId");
      if (!studentId) {
        throw new Error("Student ID not found. Please log in again.");
      }

      const response = await fetch(`${BACKEND_URL}/api/students/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, votes: selections }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit vote");
      }

      alert("Congratulations! Your vote has been submitted successfully.");
      sessionStorage.removeItem("studentId");
      navigate("/student-login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  // Filter positions to only those with candidates, preserving order
  const validPositions = positions.filter(
    (position) => candidates[position]?.length > 0
  );

  return (
    <div className="bg-gray-100">
      {/* Header */}
      <div className="text-center py-8 bg-blue-800 text-white">
        <img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl md:text-4xl font-bold">
          JUASS EVoting - Cast Your Vote
        </h1>
        <p className="text-lg md:text-xl mt-2">
          Select one candidate per position
        </p>
      </div>

      {/* Error or Loading State */}
      {loading && (
        <div className="text-center p-4 text-gray-600">
          Loading candidates...
        </div>
      )}
      {error && <div className="text-center p-4 text-red-600">{error}</div>}

      {/* Voting Sections */}
      {!loading && !error && validPositions.length === 0 && (
        <div className="text-center p-4 text-gray-600">
          No candidates available for voting.
        </div>
      )}
      {!loading &&
        !error &&
        validPositions.map((position, index) => (
          <section
            key={position}
            id={position.toLowerCase().replace(/\s+/g, "-")}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-8">
              Vote for {position}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
              {candidates[position].map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
                >
                  <img
                    src={`${BACKEND_URL}${candidate.image}`}
                    alt={candidate.name}
                    className="w-64 h-64 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      console.error(
                        `Failed to load image for ${candidate.name}: ${BACKEND_URL}${candidate.image}`
                      );
                      e.target.src = "/placeholder.jpg"; // Ensure this file exists in public folder
                    }}
                  />
                  <p className="text-lg font-semibold text-gray-700 mb-4">
                    {candidate.name}
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={position}
                      value={candidate.id}
                      checked={selections[position] === candidate.id}
                      onChange={() => handleSelection(position, candidate.id)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="text-gray-700">Select</span>
                  </label>
                </div>
              ))}
            </div>
            {index < validPositions.length - 1 ? (
              <button
                onClick={() =>
                  scrollToSection(
                    validPositions[index + 1].toLowerCase().replace(/\s+/g, "-")
                  )
                }
                className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Next: {validPositions[index + 1]}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="mt-8 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Vote"}
              </button>
            )}
          </section>
        ))}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Your Votes
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your votes? Once submitted, your
              votes cannot be changed.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
                disabled={loading}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </footer>
    </div>
  );
};

export default Vote;
