import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function BuyerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/buyer-dashboard");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider(); // Scoped inside function for efficiency
      await signInWithPopup(auth, provider);
      navigate("/buyer-dashboard");
    } catch (err) {
      setError("Google Sign-In failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "40px", 
      maxWidth: "400px", 
      margin: "auto", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "flex-start", 
      minHeight: "100vh"
    }}>
      <h2>Buyer Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <button type="submit" disabled={!email || !password || loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <button onClick={handleGoogleLogin} disabled={loading} style={{ marginTop: "10px" }}>
        {loading ? "Signing in with Google..." : "Sign in with Google"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}

export default BuyerLogin;
