import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="bg-gray-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">

                <div className="space-x-4">
                    <Link to="/login" className="hover:text-gray-200 font-medium cursor-pointer">
                        Seller
                    </Link>
                    <Link to="/createEvent" className="hover:text-gray-200 font-medium cursor-pointer">
                        Create Event                    
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;