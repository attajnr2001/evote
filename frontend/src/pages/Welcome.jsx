import React from "react";
import { Link } from "react-router-dom";
import schLogo from "/logo.jpg";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header Section with School Badge */}
      <div className="text-center mb-8">
        <img
          src={schLogo}
          alt="JUASS School Badge"
          className="w-32 h-32 mx-auto mb-4 object-contain"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
          Welcome to JUASS EVoting
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-2">
          Juaben Senior High School Electronic Voting Platform
        </p>
      </div>

      {/* Hero Image */}
      <div className="w-full max-w-2xl mb-8">
        <img
          src="https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="JUASS Voting Banner"
          className="w-full h-64 object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/admin-login"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <span>I am an Admin</span>
        </Link>
        <Link
          to="/student-login"
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
        >
          <span>I am a Student</span>
        </Link>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
      </footer>
    </div>
  );
};

export default Welcome;
