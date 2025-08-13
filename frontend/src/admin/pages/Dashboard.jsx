import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PersonAdd,
  HowToVote,
  BarChart,
  EmojiEvents,
} from "@mui/icons-material";
import schLogo from "/logo.jpg";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    voted: 0,
    notVoted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "https://juassevote-api.onrender.com/api/admins/stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch stats");
        }

        setStats({
          totalVoters: data.totalVoters,
          voted: data.voted,
          notVoted: data.notVoted,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Add Voter",
      icon: <PersonAdd className="text-blue-600" fontSize="large" />,
      route: "/admin/add-voter",
    },
    {
      title: "Add Candidate",
      icon: <HowToVote className="text-green-600" fontSize="large" />,
      route: "/admin/add-candidate",
    },
    {
      title: "View Results",
      icon: <BarChart className="text-purple-600" fontSize="large" />,
      route: "/admin/view-results",
    },
    {
      title: "View Winners",
      icon: <EmojiEvents className="text-yellow-600" fontSize="large" />,
      route: "/admin/view-winners",
    },
  ];

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
        <p className="text-sm mt-2">Admin Dashboard</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Admin Dashboard
        </h1>

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Voting Statistics
          </h2>
          {loading && <p className="text-gray-600">Loading stats...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Voters
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalVoters}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Voted</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats.voted}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Not Voted
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {stats.notVoted}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer flex flex-col items-center"
              onClick={() => navigate(card.route)}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-700">
                {card.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} JUASS EVoting. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
