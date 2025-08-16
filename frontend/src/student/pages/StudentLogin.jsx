import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import schLogo from "/logo.jpg";

const StudentLogin = () => {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState(
    "Voting has ended. You can no longer log in to vote."
  );
  const [loading] = useState(false);
  const navigate = useNavigate();

  // Login is disabled since voting has ended
  const handleLogin = () => {
    setError("Voting has ended. You can no longer log in to vote.");
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
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}
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
            disabled={true} // Input disabled since voting has ended
          />
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700 transition duration-300 disabled:bg-violet-400"
          disabled={true} // Button disabled since voting has ended
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </footer>
    </div>
  );
};

export default StudentLogin;
