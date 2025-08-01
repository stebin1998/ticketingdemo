import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, provider } from "../firebase";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import backgroundImage from "../assets/login-image-playmi.jpg";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shouldNavigateAfterLogin, setShouldNavigateAfterLogin] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, loading: authLoading } = useAuth();

    // Navigate to dashboard when authentication is complete
    useEffect(() => {
        if (shouldNavigateAfterLogin && isAuthenticated && !authLoading) {
            const intendedPath = location.state?.from?.pathname || "/dashboard";
            navigate(intendedPath);
            setShouldNavigateAfterLogin(false);
        }
    }, [isAuthenticated, authLoading, shouldNavigateAfterLogin, navigate, location.state]);

    const handleEmailLogin = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();            
            await handleLogin();
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            // Use AuthService through context instead of direct Firebase
            await login(email, password);
            
            // Set flag to navigate after auth state is ready
            setShouldNavigateAfterLogin(true);
            } catch (err) {
                alert(err.message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            
            // Set flag to navigate after auth state is ready
            setShouldNavigateAfterLogin(true);
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                console.log("Popup closed by user.");
            } else {
                alert(err.message);
            }
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            alert("Please enter your email to reset password.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="flex flex-col md:flex-row border-[10px] border-white rounded-3xl w-full max-w-6xl min-h-[600px] p-5 bg-white shadow-2xl">
                {/* Left side - Welcome message */}
                <div className="md:w-1/2 w-full bg-blue-950 text-white rounded-3xl flex items-center justify-center p-10">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold mb-4">Welcome to Playmi</h2>
                        <p className="text-lg text-blue-100">
                            Manage your tickets, explore new experiences, and stay connected with ease.
                        </p>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="md:w-1/2 w-full p-10 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Login</h2>

                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-950"
                            disabled={loading}
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleEmailLogin}
                                className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-950"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-blue-950 font-semibold hover:text-blue-950"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={loading}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-800 text-white py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="text-right">
                            <button
                                onClick={handleResetPassword}
                                className="text-sm text-blue-950 hover:underline focus:outline-none disabled:opacity-50"
                                disabled={loading}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-300" />
                        <span className="mx-4 text-gray-500">or</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full border border-gray-300 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google logo"
                            className="w-5 h-5"
                        />
                        <span>{loading ? "Logging in..." : "Login with Google"}</span>
                    </button>

                    {/* Signup link */}
                    <div className="mt-6 text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-800 font-semibold hover:underline">
                            Register!
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
