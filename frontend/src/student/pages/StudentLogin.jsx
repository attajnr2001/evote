import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import schLogo from "/logo.jpg";

const StudentLogin = () => {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isVotingPeriodActive, setIsVotingPeriodActive] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_ENDPOINT;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/settings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch settings");
        }

        if (data.settings) {
          const currentTime = new Date(); // Use actual current time
          const startTime = new Date(data.settings.startDateTime);
          const endTime = new Date(data.settings.endDateTime);

          if (currentTime >= startTime && currentTime <= endTime) {
            setIsVotingPeriodActive(true);
          } else {
            setError(
              "Voting period is not in session. Come back later or contact admin."
            );
            setIsVotingPeriodActive(false);
          }
        } else {
          setError("No voting settings found. Contact admin.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSettings();
  }, [BACKEND_URL]);

  const handleLogin = async () => {
    if (!studentId.trim()) {
      setError("Please enter your Student ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indexNumber: studentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      // Store studentId (indexNumber) in sessionStorage
      sessionStorage.setItem("studentId", data.student.indexNumber);

      // Navigate to voting page with student data
      navigate("/student-vote", { state: { student: data.student } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header Section with School Badge */}
      <div className="text-center mb-8">
        <img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-32 h-32 mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-violet-800">
          JUASS EVoting - Student Login
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-2">
          Enter your Student ID to access the voting platform
        </p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        {fetchLoading && (
          <div className="mb-4 text-gray-600 text-sm text-center">
            Loading settings...
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}
        {!fetchLoading && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="studentId"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                placeholder="Enter your Student ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading || !isVotingPeriodActive}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className={`w-full bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700 transition duration-300 ${
                loading || !isVotingPeriodActive
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={loading || !isVotingPeriodActive}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </footer>
    </div>
  );
};

export default StudentLogin;
