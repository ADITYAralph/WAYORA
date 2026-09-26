'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Bell, MessageCircle, User, Settings, LifeBuoy, LogOut, Menu, Shield, Car, Compass, Navigation, Radio } from 'lucide-react'

import { BrandLogo } from '@/components/common/BrandLogo'

interface HeaderProps {
  userName?: string
  userImage?: string
}

export function Header({ userName = "Aditya Kaushik", userImage }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New monument review posted for Taj Mahal", time: "2m ago", type: "review" },
    { id: 2, message: "Safety alert: High crowd at Red Fort", time: "15m ago", type: "alert" },
    { id: 3, message: "Your digital ID has been verified", time: "1h ago", type: "success" }
  ])

  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      // Implement search functionality here
    }
  }

  const handleNotificationClick = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review': return '⭐'
      case 'alert': return '🚨'
      case 'success': return '✅'
      default: return '🔔'
    }
  }

  const formatTime = (time: string) => time

  return (
    <>
      <header className="header">
        <div className="header-left">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Find monuments, safety info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Horizontal Center Large Expanded Logo */}
        <div 
          className="header-center-logo cursor-pointer" 
          onClick={() => window.location.href = '/'}
        >
          <img
            src="/logo.png"
            alt="WayORA Logo"
            width={600}
            height={160}
            className="w-full h-full object-contain max-h-16 md:max-h-20 select-none bg-transparent transition-transform hover:scale-105"
          />
        </div>

        <div className="header-right">
          {/* Feedback Button */}
          <button className="feedback-btn">
            <MessageCircle size={18} />
            <span>Feedback</span>
          </button>

          {/* Notifications */}
          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read-btn"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <span className="notification-type-icon">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {formatTime(notification.time)}
                          </span>
                        </div>
                        <button
                          className="delete-notification-btn"
                          onClick={(e) => deleteNotification(notification.id, e)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="language-selector-wrapper">
            <LanguageSelector />
          </div>

          {/* Profile Dropdown */}
          <div className="profile-container" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src={userProfilePic}
                alt="Profile"
                className="profile-pic"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/api/placeholder/40/40'
                }}
              />
              <div className="profile-indicator"></div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-avatar-large">
                    <img
                      src={userProfilePic}
                      alt="Profile"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/40/40'
                      }}
                    />
                  </div>
                  <div className="profile-dropdown-info">
                    <h4>{userName}</h4>
                    <p>Tourist ID: TID{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>

                <div className="profile-menu-items">
                  <button className="profile-menu-item" onClick={() => window.location.href = '/safepath-x'}>
                    <Shield size={18} className="text-cyan-400" />
                    <span>WayORA Next-Gen Portal</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/safepath-x/command-center'}>
                    <Settings size={18} className="text-blue-400" />
                    <span>WayORA National Command Deck</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/ride'}>
                    <Car size={18} className="text-cyan-400" />
                    <span>Ride Shield & FairFare</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/explore'}>
                    <Compass size={18} className="text-emerald-400" />
                    <span>Safe Radar Discovery</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/dashboard'}>
                    <Shield size={18} />
                    <span>Tourist Safety Portal</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/dashboard/authority'}>
                    <Settings size={18} />
                    <span>Authority Command Center</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/edit-profile'}>
                    <User size={18} />
                    <span>Edit Profile</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => window.location.href = '/customer-care'}>
                    <LifeBuoy size={18} />
                    <span>Customer Care</span>
                  </button>
                </div>

                <div className="profile-menu-footer">
                  <button className="profile-menu-item logout" onClick={() => {
                    localStorage.removeItem('tourist_digital_id');
                    localStorage.removeItem('wayora_token');
                    window.location.href = '/';
                  }}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 88px;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 50;
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          max-width: 300px;
          width: 100%;
          z-index: 10;
        }

        .header-center-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 450px;
          max-width: calc(100% - 640px);
          height: 100%;
          padding: 6px 0;
          z-index: 5;
        }

        .search-form {
          width: 100%;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 16px 0 40px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #1e293b;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feedback-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feedback-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .notification-container {
          position: relative;
        }

        .notification-btn {
          position: relative;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notification-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-btn:hover {
          background: #f1f5f9;
        }

        .profile-name {
          color: #1e293b;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc2626;
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          z-index: 100;
        }

        .notification-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .notification-count {
          background: #3b82f6;
          color: white;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 12px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          gap: 12px;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content p {
          margin: 0 0 4px 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.4;
        }

        .notification-time {
          color: #6b7280;
          font-size: 12px;
        }

        .no-notifications {
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
        }

        .profile-container {
          position: relative;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: relative;
        }

        .profile-name {
          color: white;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
        }

        .profile-status {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          right: -12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          z-index: 100;
        }

        .profile-dropdown-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .profile-avatar-large {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
        }

        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder-large {
          width: 100%;
          height: 100%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
        }

        .profile-dropdown-info h4 {
          margin: 0 0 4px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .profile-dropdown-info p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .profile-menu-items {
          padding: 8px;
        }

        .profile-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #374151;
          font-size: 14px;
          text-align: left;
        }

        .profile-menu-item:hover {
          background: #f3f4f6;
        }

        .profile-menu-footer {
          padding: 8px;
          border-top: 1px solid #e5e7eb;
        }

        .profile-menu-item.logout {
          color: #dc2626;
        }

        .profile-menu-item.logout:hover {
          background: #fef2f2;
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 16px;
          }
          
          .header-center {
            margin: 0 16px;
          }
          
          .logo-text {
            display: none;
          }
          
          .feedback-btn span {
            display: none;
          }
          
          .profile-name {
            display: none;
          }
          
          .notification-dropdown,
          .profile-dropdown {
            width: 280px;
          }
        }
      `}</style>
    </>
  )
}
