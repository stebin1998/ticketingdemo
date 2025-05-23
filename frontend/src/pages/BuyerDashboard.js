import React from "react";
import { Link } from "react-router-dom";

function BuyerDashboard() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to the Buyer Dashboard!</h1>
      <p>You’re successfully logged in.</p>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Log out
      </Link>
    </div>
  );
}

export default BuyerDashboard;
