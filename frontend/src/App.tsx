// frontend/src/App.tsx

import React, { useState } from "react";

// Main App Component for the Task Tracker
const App: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>("Unknown");

  // Simple function to call the backend health check (replace with actual fetch later)
  const checkBackendStatus = async () => {
    try {
      // Assuming FastAPI runs on http://localhost:8000 for local dev
      const response = await fetch("http://localhost:8000/api/health");
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status.toUpperCase());
      } else {
        setApiStatus("ERROR");
      }
    } catch (error) {
      console.error("Failed to fetch backend status:", error);
      setApiStatus("OFFLINE");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-2 font-inter">
          Task Tracker
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Monorepo Template Setup Complete!
        </p>
      </header>

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg transition duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Development Status Check
        </h2>

        <div className="flex justify-between items-center mb-6 p-3 bg-gray-100 rounded-lg">
          <span className="text-lg font-mono">Backend API Status:</span>
          <span
            className={`px-4 py-1 rounded-full text-sm font-bold ${
              apiStatus === "HEALTHY"
                ? "bg-green-100 text-green-700"
                : apiStatus === "OFFLINE"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {apiStatus}
          </span>
        </div>

        <button
          onClick={checkBackendStatus}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Ping Backend (localhost:8000)
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Next Step: Integrate User Authentication and State Management.
        </p>
      </div>
    </div>
  );
};

export default App;
