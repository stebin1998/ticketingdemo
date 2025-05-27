import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

const Demo = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      alert("Error logging out: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-gray-800">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-4">lets goo it worked!</h1>
        <p className="text-lg mb-6">
          Logged in succesfully. Thank again for the opportunity to work at Playmi
        </p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Demo;
