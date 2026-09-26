import React, { useState, useRef, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = ({ 
  user = { 
    name: "Aditya Kaushik", 
    profilePic: "/api/placeholder/40/40",
    email: "aditya@wayora.com",
    uid: "",
    emailVerified: false
  },
  onLogout 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const menuOptions = [
    {
      icon: '🛡️',
      label: 'Tourist Safety Portal',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/dashboard';
      }
    },
    {
      icon: '🏢',
      label: 'Authority Command Center',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/dashboard/authority';
      }
    },
    {
      icon: '👤',
      label: 'Edit Profile',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/edit-profile';
      }
    },
    {
      icon: '📞',
      label: 'Customer Care',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/customer-care';
      }
    },
    {
      icon: '📊',
      label: 'Personal Analytics',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/user-dashboard';
      }
    },
    {
      icon: '⚙️',
      label: 'Settings',
      action: () => {
        setIsDropdownOpen(false);
        window.location.href = '/settings';
      }
    }
  ];

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      {/* Profile Picture with Status Indicator */}
      <div 
        className="profile-picture-wrapper"
        onClick={handleProfileClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
      >
        <img 
          src={user.profilePic} 
          alt={user.name}
          className="profile-picture"
        />
        <div className="status-indicator online"></div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <img src={user.profilePic} alt={user.name} className="dropdown-profile-pic" />
            <div className="user-info">
              <h4>{user.name}</h4>
              <span className="user-status">
                {user.emailVerified ? '✓ Verified' : 'Online'}
              </span>
              {user.email && (
                <span className="user-email">{user.email}</span>
              )}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu-items">
            {menuOptions.map((option, index) => (
              <button
                key={index}
                className="dropdown-item"
                onClick={option.action}
              >
                <span className="dropdown-icon">{option.icon}</span>
                <span className="dropdown-label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout-item" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span>
            <span className="dropdown-label">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;