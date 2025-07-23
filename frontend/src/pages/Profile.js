// /src/pages/Profile.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { FaCheckCircle, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';
import TicketMiLogo from '../assets/ticketmi-logo.png';
import { useAuth } from '../contexts/AuthContext';

// Format event date time
const formatEventDateTime = (event) => {
  if (!event.dateTimes) return 'TBD';
  
  if (event.dateTimes.singleStartDate) {
    const startDate = new Date(event.dateTimes.singleStartDate);
    const startTime = event.dateTimes.singleStartTime || '';
    return `${startDate.toLocaleDateString()} ${startTime}`;
  }
  
  if (event.dateTimes.eventSlots && event.dateTimes.eventSlots.length > 0) {
    const firstSlot = event.dateTimes.eventSlots[0];
    const startDate = new Date(firstSlot.startDate);
    return `${startDate.toLocaleDateString()} ${firstSlot.startTime}`;
  }
  
  return 'TBD';
};

const ProfileEditModal = ({ isOpen, onClose, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    socialMedia: {
      instagram: '',
      tiktok: '',
      twitter: '',
      facebook: '',
      youtube: ''
    }
  });
  
  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        socialMedia: {
          instagram: profileData.socialMedia?.instagram || '',
          tiktok: profileData.socialMedia?.tiktok || '',
          twitter: profileData.socialMedia?.twitter || '',
          facebook: profileData.socialMedia?.facebook || '',
          youtube: profileData.socialMedia?.youtube || ''
        }
      });
    }
  }, [profileData]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A299DA] focus:border-transparent"
              placeholder="Your display name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A299DA] focus:border-transparent"
              placeholder="@username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A299DA] focus:border-transparent"
              rows="3"
              maxLength="500"
              placeholder="Tell us about yourself..."
            />
            <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A299DA] focus:border-transparent"
              placeholder="City, Country"
            />
          </div>
          

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Social Media</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(formData.socialMedia).map(([platform, value]) => (
                <div key={platform}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{platform}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A299DA] focus:border-transparent"
                    placeholder={`@${platform}_handle`}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#2D2B8F] text-white rounded-md hover:bg-opacity-90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, isAuthenticated, loading } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventStats, setEventStats] = useState({ upcoming: 0, past: 0, total: 0 });
  
  // Direct image upload state
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  // Memoize profile values to prevent unnecessary re-renders
  const profileValues = useMemo(() => {
    const displayName = profileData?.displayName || currentUser?.displayName || 'User';
    const username = profileData?.username ? `@${profileData.username}` : userProfile?.email || '';
    const location = profileData?.location || 'Location not set';
    const bio = profileData?.bio || '';
    const avatar = profileData?.profilePicture || currentUser?.photoURL || `https://placehold.co/160x160/A299DA/FFFFFF?text=${displayName.charAt(0).toUpperCase()}`;
    
    console.log('Avatar calculation:');
    console.log('- profileData?.profilePicture:', profileData?.profilePicture ? 'EXISTS' : 'MISSING');
    console.log('- currentUser?.photoURL:', currentUser?.photoURL ? 'EXISTS' : 'MISSING');
    console.log('- final avatar:', avatar);
    
    return { displayName, username, location, bio, avatar };
  }, [profileData, currentUser, userProfile]);
  
  // Fetch both profile and events data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Add small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch profile data
        const profileResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/profile/full/${currentUser.uid}`);
        let profileData = null;
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          setProfileData(profileData);
        } else {
          console.error('Failed to fetch profile:', profileResponse.statusText);
        }
        
        // Fetch events data if user role is available
        if (userProfile?.role) {
          let eventsUrl;
          
          if (userProfile.role === 'seller' || userProfile.role === 'admin') {
            eventsUrl = `${process.env.REACT_APP_API_BASE_URL}/events/by-user/${currentUser.uid}`;
          } else {
            eventsUrl = `${process.env.REACT_APP_API_BASE_URL}/events/purchased/${currentUser.uid}`;
          }
          
          const eventsResponse = await fetch(eventsUrl);
          
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            setEvents(eventsData.events || []);
            
            if (eventsData.categorized) {
              setEventStats(eventsData.categorized);
            }
          } else {
            console.error('Failed to fetch events:', eventsResponse.statusText);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, userProfile?.role]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    try {
      console.log('Updating profile with data:', updatedData);
      const token = await currentUser.getIdToken();
      console.log('Firebase token obtained, making request...');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/profile/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated successfully:', data);
        setProfileData(data.user);
        setIsEditModalOpen(false);
      } else {
        const error = await response.json();
        console.error('Backend error:', error);
        alert(`Error updating profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };
  
  // Direct image upload functions
  const handleDirectImageUpload = async (file, type) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    
    const isProfile = type === 'profile';
    isProfile ? setIsUploadingProfile(true) : setIsUploadingBanner(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        console.log(`Uploading ${isProfile ? 'profile picture' : 'banner'}, base64 length:`, base64String.length);
        
        const updateData = isProfile 
          ? { profilePicture: base64String }
          : { bannerImage: base64String };
        
        console.log('Update data:', updateData);
        
        const token = await currentUser.getIdToken();
        
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/profile/${currentUser.uid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend response:', data);
          setProfileData(data.user || data);
          console.log('Updated profile data:', data.user || data);
        } else {
          const error = await response.json();
          console.error('Backend error:', error);
          alert(`Error uploading ${isProfile ? 'profile picture' : 'banner'}: ${error.error}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading ${isProfile ? 'profile picture' : 'banner'}. Please try again.`);
    } finally {
      isProfile ? setIsUploadingProfile(false) : setIsUploadingBanner(false);
    }
  };
  
  // Trigger file input
  const triggerFileInput = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleDirectImageUpload(file, type);
      }
    };
    input.click();
  };
  
  // Get social media icons with links
  const getSocialIcon = (platform, handle) => {
    const iconClass = "w-6 h-6 text-gray-800 hover:text-[#A299DA] transition-colors cursor-pointer";
    
    const getUrl = (platform, handle) => {
      // Remove @ symbol if present
      const cleanHandle = handle.replace('@', '');
      switch (platform) {
        case 'instagram': return `https://instagram.com/${cleanHandle}`;
        case 'tiktok': return `https://tiktok.com/@${cleanHandle}`;
        case 'twitter': return `https://twitter.com/${cleanHandle}`;
        case 'facebook': return `https://facebook.com/${cleanHandle}`;
        case 'youtube': return `https://youtube.com/@${cleanHandle}`;
        default: return '#';
      }
    };
    
    const url = getUrl(platform, handle);
    
    const icon = (() => {
      switch (platform) {
        case 'instagram': return <FaInstagram className={iconClass} />;
        case 'tiktok': return <FaTiktok className={iconClass} />;
        case 'twitter': return <FaTwitter className={iconClass} />;
        case 'facebook': return <FaFacebook className={iconClass} />;
        case 'youtube': return <FaYoutube className={iconClass} />;
        default: return null;
      }
    })();
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:scale-110 transition-transform"
      >
        {icon}
      </a>
    );
  };
  
  // Loading states
  if (loading || !isAuthenticated || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A299DA] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  const { displayName, username, location, bio, avatar } = profileValues;
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#A299DA] px-4 md:px-8 py-4 flex justify-between items-center">
        <img src={TicketMiLogo} alt="TicketMi" className="h-8 md:h-12" />
        <button 
          onClick={handleLogout}
          className="bg-[#2D2B8F] text-white px-4 md:px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-sm md:text-base"
        >
          Logout
        </button>
      </header>

      {/* Banner and Profile Section */}
      <div className="flex flex-col items-center w-full bg-white">
        {/* Banner */}
        <div className="w-full max-w-5xl mx-auto mt-4 md:mt-6 px-4 relative">
          <div 
            className="w-full h-48 md:h-64 bg-cover bg-center bg-no-repeat relative rounded-lg"
            style={{
              backgroundImage: profileData?.bannerImage 
                ? `url(${profileData.bannerImage})` 
                : 'linear-gradient(135deg, #A299DA 0%, #9333EA 100%)'
            }}
          >
            {/* Debug: Banner image info */}
            {console.log('Banner image:', profileData?.bannerImage ? 'EXISTS' : 'MISSING')}
            {console.log('Banner style:', profileData?.bannerImage 
              ? `url(${profileData.bannerImage})` 
              : 'linear-gradient(135deg, #A299DA 0%, #9333EA 100%)')}
          
            {/* Banner Edit Button - Always Visible */}
            <button
              onClick={() => triggerFileInput('banner')}
              disabled={isUploadingBanner}
              className="absolute top-4 right-4 bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              title="Change banner image"
            >
              {isUploadingBanner ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Profile Picture - Overlapping Banner */}
          <div className="absolute bottom-0 left-4 md:left-8 transform translate-y-1/2">
          <img
              src={avatar}
            alt="Avatar"
              className="w-24 h-24 md:w-40 md:h-40 rounded-full border-4 border-white bg-[#A299DA] shadow-lg"
            />
            {/* Profile Picture Edit Button - Always Visible */}
            <button
              onClick={() => triggerFileInput('profile')}
              disabled={isUploadingProfile}
              className="absolute -bottom-1 -right-1 bg-white text-gray-700 p-2 rounded-full shadow-lg border-2 border-white hover:bg-gray-50 transition-all hover:scale-105 disabled:opacity-50"
              title="Change profile picture"
            >
              {isUploadingProfile ? (
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Profile Info Card */}
        <div className="w-full max-w-5xl mx-auto bg-white px-4 md:px-8 pb-6 pt-14 md:pt-20">
          <div className="flex flex-col md:flex-row w-full items-start justify-between">
            {/* Left side - Profile Info */}
            <div className="flex flex-col md:flex-row items-start w-full">
              {/* Left spacing for profile picture */}
              <div className="w-24 md:w-40 flex-shrink-0"></div>
              
              {/* Profile Info - To the right of profile picture */}
              <div className="flex-1 md:ml-6 mt-4 md:mt-2">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{displayName}</h1>
                    {userProfile?.role === 'seller' && <FaCheckCircle className="text-[#5E4DC3] w-4 h-4 md:w-5 md:h-5" />}
              </div>
                  <p className="text-gray-600 text-sm md:text-base">{username} · {location}</p>
                  {bio && <p className="text-gray-700 text-sm md:text-base mt-1">{bio}</p>}
                  
                  {/* Social Media Icons */}
                  {profileData?.socialMedia && (
              <div className="flex gap-4 mt-2">
                      {Object.entries(profileData.socialMedia).map(([platform, handle]) => 
                        handle ? (
                          <span key={platform} title={`${platform}: ${handle}`}>
                            {getSocialIcon(platform, handle)}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex flex-col items-end mt-4 md:mt-2 ml-auto">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#343280] text-white font-medium hover:bg-opacity-90 transition-colors text-center"
                style={{
                  width: '147px',
                  height: '39px',
                  borderRadius: '3px',
                  fontSize: '18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  lineHeight: '150%',
                  letterSpacing: '-0.019em'
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-5xl border-b border-gray-200 my-6" />
        
        {/* Events Section */}
        <div className="w-full max-w-5xl px-4 md:px-8 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              {userProfile?.role === 'seller' ? 'My Events' : 'My Tickets'}
            </h2>
            
            {/* Event Stats for Buyers */}
            {userProfile?.role === 'user' && (
              <div className="flex gap-4 text-sm text-gray-600">
                <span><FaCalendarAlt className="inline w-4 h-4 mr-1" />{eventStats.upcoming} Upcoming</span>
                <span><FaTicketAlt className="inline w-4 h-4 mr-1" />{eventStats.past} Past</span>
              </div>
            )}
          </div>
          
          {/* Events Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A299DA]"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {event.files && event.files.length > 0 ? (
                      <img 
                        src={event.files[0]} 
                        alt={event.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate">{event.name}</h3>
                      {userProfile?.role === 'seller' && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.eventSettings?.publishStatus === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.eventSettings?.publishStatus === 'published' ? <FaEye className="inline w-3 h-3 mr-1" /> : <FaEyeSlash className="inline w-3 h-3 mr-1" />}
                          {event.eventSettings?.publishStatus || 'draft'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {formatEventDateTime(event)}
                    </p>
                    
                    <p className="text-gray-600 text-sm mb-2 truncate">
                      {event.location?.venueName || event.location?.city || 'Online'}
                    </p>
                    
                    {/* Show purchase info for buyers */}
                    {event.ticketPurchase && (
                      <div className="text-sm text-gray-500 border-t pt-2">
                        <p>Purchased: {new Date(event.ticketPurchase.purchaseDate).toLocaleDateString()}</p>
                        <p>Quantity: {event.ticketPurchase.quantity} × {event.ticketPurchase.ticketTierName}</p>
                        {event.ticketPurchase.totalAmount > 0 && (
                          <p>Total: ${event.ticketPurchase.totalAmount}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {userProfile?.role === 'seller' ? (
                  <FaCalendarAlt className="w-12 h-12 mx-auto" />
                ) : (
                  <FaTicketAlt className="w-12 h-12 mx-auto" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {userProfile?.role === 'seller' ? 'No Events Created Yet' : 'No Tickets Purchased Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {userProfile?.role === 'seller' 
                  ? 'Start creating your first event to get started!'
                  : 'Browse events and purchase tickets to see them here.'
                }
              </p>
              <button 
                onClick={() => navigate(userProfile?.role === 'seller' ? '/create-event' : '/dashboard')}
                className="bg-[#2D2B8F] text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                {userProfile?.role === 'seller' ? 'Create Event' : 'Browse Events'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#A299DA] py-6 px-4 md:px-8 flex flex-col md:flex-row items-center md:justify-between text-white">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <img src={TicketMiLogo} alt="TicketMi" className="h-8 md:h-12" />
          <span className="text-sm md:text-base lg:text-lg">© 2025 TicketMi. All Rights Reserved.</span>
        </div>
        <div className="flex gap-4 md:gap-6 lg:gap-12">
          <a href="#about" className="hover:underline text-sm md:text-base lg:text-lg">About</a>
          <a href="#contact" className="hover:underline text-sm md:text-base lg:text-lg">Contact</a>
          <a href="#privacy" className="hover:underline text-sm md:text-base lg:text-lg">Privacy</a>
        </div>
      </footer>
      
      {/* Edit Profile Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
