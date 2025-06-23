import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import backgroundImage from "../assets/login-image-playmi.jpg";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Add a small delay to let AuthContext sync before redirecting
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="flex flex-col md:flex-row border-[10px] border-white rounded-3xl w-full max-w-6xl min-h-[600px] bg-white shadow-2xl">
                
                {/* Left Side - Welcome */}
                <div className="md:w-1/2 w-full bg-blue-950 text-white rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl flex flex-col justify-center items-center p-10">
                    <h2 className="text-4xl font-extrabold mb-4 text-center">Welcome to Playmi</h2>
                    <p className="text-lg text-blue-100 text-center">
                        Manage your tickets, explore new experiences, and stay connected with ease.
                    </p>
                </div>

                {/* Right Side - Signup Form */}
                <div className="md:w-1/2 w-full p-10 md:p-20 text-center flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign Up</h2>

                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-950"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-950"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-blue-800 font-semibold hover:text-blue-800"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button
                            onClick={handleSignup}
                            className="w-full bg-blue-800 text-white py-2 rounded-full hover:bg-blue-700 transition"
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="mt-6 text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-800 font-semibold hover:underline">
                            Login!
                        </Link>
                    </div>

                    {/* Seller Option */}
                    <div className="mt-6">
                        <Link 
                            to="/seller-signup"
                            className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition"
                        >
                            I would like to be a seller
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
