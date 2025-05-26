import React from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <section className="bg-white py-20 px-6 text-center shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Playmi!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your tickets, view stats, and explore powerful tools to streamline your workflow.
        </p>
      </section>

      <main className="p-6">
        {/* Additional content can go here */}
      </main>
    </div>
  );
}

export default Dashboard;
