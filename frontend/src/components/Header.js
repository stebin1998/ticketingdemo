import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faSearch,
  faMapMarkerAlt,
  faChevronDown,
  faPlus,
  faBars,
  faTimes,
  faUser,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import TicketMiLogo from '../assets/ticketmi-logo.png';
import { useAuth } from '../hooks/useAuth';

const Header = ({ searchQuery, onSearchChange, locationFilter, onLocationChange }) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const options = ["All Locations", "Toronto", "Vancouver", "Montreal"];
  const { isAuthenticated, logout, userInfo, profile, canCreateEvents } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleCreateEventClick = (e) => {
    e.preventDefault();
    if (canCreateEvents()) {
      // User is already a seller - go to create event
      navigate('/createEvent');
    } else if (isAuthenticated) {
      // User is logged in but not a seller - redirect to upgrade
      navigate('/upgrade-to-seller?redirect=/create-event');
    } else {
      // User is not logged in - redirect to seller signup
      navigate('/seller-signup');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between gap-4">


        {/* LEFT SIDE: Dropdown + Logo */}
        <div className="flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={TicketMiLogo} alt="TicketMi Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Search & Filters */}
        <div className="hidden md:flex items-center gap-3 w-full max-w-lg">
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

          <div className="relative flex-grow">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="w-full flex items-center justify-between border border-[#756AB6] rounded-full px-4 py-2 text-sm text-[#2D2B8F] focus:outline-none focus:ring-2 focus:ring-[#C3A2FF] transition duration-200"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              {locationFilter || "All Locations"}
              <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
            </button>

            {isLocationDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {options.map(option => (
                  <li
                    key={option}
                    onClick={() => {
                      onLocationChange(option);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-[#9E9EFA] cursor-pointer ${locationFilter === option ? "bg-[#756AB6] font-medium text-white" : ""
                      }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Desktop Nav Buttons */}
        <div className="hidden md:flex space-x-3">
          <button
            onClick={handleCreateEventClick}
            className="flex items-center px-3 py-2 border border-[#2D2B8F] rounded-full text-[#2D2B8F] text-sm hover:bg-[#2D2B8F] hover:text-white transition duration-200 ease-in-out"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create Events
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center px-3 py-2 border border-[#2D2B8F] rounded-full text-[#2D2B8F] text-sm hover:bg-[#2D2B8F] hover:text-white transition duration-200 ease-in-out"
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                {userInfo?.email?.split('@')[0] || 'User'}
                <FontAwesomeIcon icon={faChevronDown} className="ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{userInfo?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.role || 'user'}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                    Profile
                  </Link>
                  <Link to="/my-events" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    My Events
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 border border-[#2D2B8F] rounded-full text-sm text-[#2D2B8F] hover:bg-[#2D2B8F] hover:text-white transition duration-200 ease-in-out"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden text-[#2D2B8F] text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg p-4 space-y-4">
          <input
            type="text"
            placeholder="Search for events or artists…"
            className="w-full border border-gray-500 rounded-full px-4 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <div className="relative">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="w-full flex items-center justify-between border border-[#756AB6] rounded-full px-4 py-2 text-sm text-[#2D2B8F]"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              {locationFilter || "All Locations"}
              <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
            </button>

            {isLocationDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {options.map(option => (
                  <li
                    key={option}
                    onClick={() => {
                      onLocationChange(option);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-[#9E9EFA] cursor-pointer ${locationFilter === option ? "bg-[#756AB6] font-medium text-white" : ""
                      }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleCreateEventClick}
            className="block w-full text-[#2D2B8F] border border-[#2D2B8F] rounded-full px-4 py-2 text-center"
          >
            Create Events
          </button>

          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/profile"
                className="block text-[#2D2B8F] border border-[#2D2B8F] rounded-full px-4 py-2 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-red-600 border border-red-600 rounded-full px-4 py-2 text-center hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="block text-[#2D2B8F] border border-[#2D2B8F] rounded-full px-4 py-2 text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
