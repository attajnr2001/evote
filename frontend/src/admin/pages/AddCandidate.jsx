import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PersonAdd } from "@mui/icons-material";
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

const AddCandidate = () => {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    position: "",
    year: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("idNumber", formData.idNumber);
    data.append("name", formData.name);
    data.append("position", formData.position);
    data.append("year", formData.year);
    if (image) {
      data.append("image", image);
    }

    try {
      const response = await fetch(
        "https://juassevote-api.onrender.com/api/admins/add-candidate",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add candidate");
      }

      alert("Candidate added successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-sm mt-2">Add Candidate</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Add New Candidate
        </h1>

        {/* Form */}
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="idNumber"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Student ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                placeholder="Enter student ID number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.idNumber}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter candidate name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="position"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Position
              </label>
              <select
                id="position"
                name="position"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.position}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select a position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="year"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Year
              </label>
              <input
                type="text"
                id="year"
                name="year"
                placeholder="Enter year (e.g., 2025)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.year}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Candidate Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                onChange={handleImageChange}
                disabled={loading}
                required
              />
            </div>
            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Candidate Preview"
                  className="w-64 h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-400 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <PersonAdd />
              {loading ? "Adding Candidate..." : "Add Candidate"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AddCandidate;
