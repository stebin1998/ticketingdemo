import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import TicketMiLogo from '../assets/ticketmi-logo.png';

const Header = ({ searchQuery, onSearchChange, locationFilter, onLocationChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const options = ["All Locations", "Toronto", "Vancouver", "Montreal"];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between space-x-3">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={TicketMiLogo} alt="TicketMi Logo" className="h-12 w-auto" />
        </Link>

        {/* Search & Location (adjusted width & touch of color) */}
        <div className="flex items-center gap-3 w-full max-w-lg">
          
          {/* Search Bar (slightly wider) */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for events or artists…"
              className="pl-10 pr-4 py-2 border border-gray-500 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[#C3A2FF] text-gray-700 text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3 text-gray-400 text-sm" />
          </div>

          {/* Location Dropdown (clean, subtle purple) */}
          <div className="relative flex-grow">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between border border-[#756AB6] rounded-full px-4 py-2 text-sm text-[#2D2B8F] focus:outline-none focus:ring-2 focus:ring-[#C3A2FF] transition duration-200"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              {locationFilter || "All Locations"}
              <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
            </button>

            {isDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {options.map(option => (
                  <li
                    key={option}
                    onClick={() => {
                      onLocationChange(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-[#9E9EFA] cursor-pointer ${
                      locationFilter === option ? "bg-[#756AB6] font-medium text-white" : ""
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Buttons (unchanged) */}
        <div className="flex space-x-3">
          <Link
            to="/create"
            className="flex items-center px-3 py-2 border border-[#2D2B8F] rounded-full text-[#2D2B8F] text-sm hover:bg-[#2D2B8F] hover:text-white transition duration-200 ease-in-out"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create Events
          </Link>
          <Link
            to="/login"
            className="px-3 py-2 border border-[#2D2B8F] rounded-full text-sm text-[#2D2B8F] hover:bg-[#2D2B8F] hover:text-white transition duration-200 ease-in-out"
          >
            Login
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;
