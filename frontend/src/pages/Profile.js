// /src/pages/Profile.js
import React from 'react';
import { FaInstagram, FaTiktok, FaYoutube, FaXTwitter, FaFacebook, FaCircleCheck, FaUsers } from 'react-icons/fa6';
import TicketMiLogo from '../assets/ticketmi-logo.png';
import EventCard from '../components/EventCard';

const profile = {
  name: 'TicketMi',
  username: '@OfficialTicketMi',
  location: 'Toronto, Canada',
  followers: '',
  avatar: 'https://placehold.co/160x160/A299DA/FFFFFF?text=TM',
  socials: [
    { icon: <FaInstagram className="w-6 h-6 text-gray-800" />, name: 'Instagram' },
    { icon: <FaTiktok className="w-6 h-6 text-gray-800" />, name: 'TikTok' },
    { icon: <FaXTwitter className="w-6 h-6 text-gray-800" />, name: 'X' },
    { icon: <FaFacebook className="w-6 h-6 text-gray-800" />, name: 'Facebook' },
    { icon: <FaYoutube className="w-6 h-6 text-gray-800" />, name: 'YouTube' },
  ],
};

const event = {
  title: 'Event Name',
  location: 'Toronto',
  price: 25,
  category: 'Category',
  imageUrl: '',
  ticketsAvailable: 50,
  organizer: 'TicketMi',
  showVerified: true,
  showIcons: true,
  showBuyButton: true,
};

// Add a simple formatDate function
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

const Profile = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#A299DA] px-8 py-4 flex justify-between items-center">
        <img src={TicketMiLogo} alt="TicketMi" className="h-12" />
        <button className="bg-[#2D2B8F] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
          Logout
        </button>
      </header>

      {/* Banner and Profile Section */}
      <div className="flex flex-col items-center w-full bg-white">
        {/* Banner */}
        <div className="relative w-full flex flex-col items-center" style={{ background: '#fff' }}>
          <div className="w-full max-w-5xl h-72 bg-[#A299DA] mt-6 rounded" />
          {/* Avatar */}
          <img
            src={profile.avatar}
            alt="Avatar"
            className="absolute left-0 ml-[calc(8rem+2rem)] -bottom-16 w-40 h-40 rounded-full border-4 border-white bg-[#A299DA] shadow-lg"
            style={{ top: 'calc(100% - 80px)' }}
          />
        </div>
        {/* Profile Info Card */}
        <div className="w-full max-w-5xl mx-auto flex flex-col items-start bg-white pt-24 pb-6 pl-16">
          <div className="flex flex-col md:flex-row w-full justify-between items-start px-0">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <FaCircleCheck className="text-[#5E4DC3] w-5 h-5" />
              </div>
              <p className="text-gray-600">{profile.username} · {profile.location}</p>
              <div className="flex gap-4 mt-2">
                {profile.socials.map((s, i) => (
                  <span key={i} title={s.name}>{s.icon}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 mt-6 md:mt-0">
              <div className="flex items-center gap-2">
                <FaUsers className="w-5 h-5" />
                <span className="font-bold text-lg">{profile.followers}</span>
                <span className="text-gray-700">Followers</span>
              </div>
              <button className="bg-[#2D2B8F] text-white px-8 py-2 rounded-2xl font-medium mt-2 hover:bg-opacity-90 transition-colors">
                Follow
              </button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-5xl border-b border-black my-6" />
        {/* Event Card Section */}
        <div className="w-full max-w-5xl flex flex-col items-start pl-16 mb-16">
          <div className="w-full max-w-xs">
            <EventCard event={event} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#A299DA] py-6 px-4 md:px-8 flex flex-col md:flex-row items-center md:justify-between text-white">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <img src={TicketMiLogo} alt="TicketMi" className="h-12" />
          <span className="text-base md:text-lg">© 2025 TicketMi. All Rights Reserved.</span>
        </div>
        <div className="flex gap-6 md:gap-12">
          <a href="#about" className="hover:underline text-base md:text-lg">About</a>
          <a href="#contact" className="hover:underline text-base md:text-lg">Contact</a>
          <a href="#privacy" className="hover:underline text-base md:text-lg">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
