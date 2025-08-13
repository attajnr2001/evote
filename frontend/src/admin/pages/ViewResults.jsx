import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/icons-material";
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

const ViewResults = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BACKEND_URL = "https://juassevote-api.onrender.com";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admins/results`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch results");
        }

        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter positions to only those with candidates
  const validPositions = positions.filter(
    (position) => results[position]?.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar-like Header */}
      <div className="w-full md:w-64 bg-blue-800 text-white p-6 flex flex-col items-center">
        <img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-24 h-24 mb-4 object-contain"
        />
        <h1 className="text-2xl font-bold">JUASS EVoting</h1>
        <p className="text-sm mt-2">View Results</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 flex items-center gap-2">
          <BarChart />
          Election Results
        </h1>

        {/* Error or Loading State */}
        {loading && (
          <div className="text-center p-4 text-gray-600">
            Loading results...
          </div>
        )}
        {error && <div className="text-center p-4 text-red-600">{error}</div>}

        {/* Results Sections */}
        {!loading && !error && validPositions.length === 0 && (
          <div className="text-center p-4 text-gray-600">
            No results available.
          </div>
        )}
        {!loading &&
          !error &&
          validPositions.map((position) => (
            <section key={position} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {position}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {results[position]
                  .sort((a, b) => b.votes - a.votes) // Sort by votes descending
                  .map((candidate) => (
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
                          e.target.src = "/placeholder.jpg"; // Ensure this exists in public folder
                        }}
                      />
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Votes:{" "}
                        <span className="font-bold text-blue-600">
                          {candidate.votes}
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          ))}

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default ViewResults;
