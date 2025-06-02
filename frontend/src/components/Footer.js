import React from 'react';
import TicketMiLogo from '../assets/ticketmi-logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-5 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <img src={TicketMiLogo} alt="TicketMi Logo" className="h-8 mr-2" />
          <span className="text-sm text-gray-300">© {new Date().getFullYear()} TicketMi. All rights reserved.</span>
        </div>
        <div className="flex space-x-4">
          <a href="/" className="text-gray-300 hover:text-white text-sm">About</a>
          <a href="/" className="text-gray-300 hover:text-white text-sm">Contact</a>
          <a href="/" className="text-gray-300 hover:text-white text-sm">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
