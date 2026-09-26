import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CustomerCare = () => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'support', message: `Hello ${user?.displayName || user?.email?.split('@')[0] || 'there'}! How can I help you today?`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();

    // Add user info to ticket
    const ticketWithUserInfo = {
      ...ticket,
      userEmail: user?.email,
      userName: getUserDisplayName(),
      userId: user?.uid,
      timestamp: new Date().toISOString()
    };

    console.log('Submitting ticket:', ticketWithUserInfo);

    // Save ticket to localStorage for this user
    const existingTickets = JSON.parse(localStorage.getItem(`userTickets_${user?.uid}`) || '[]');
    existingTickets.unshift({
      ...ticketWithUserInfo,
      ticketId: Date.now(),
      status: 'pending'
    });
    localStorage.setItem(`userTickets_${user?.uid}`, JSON.stringify(existingTickets));

    alert(`Support ticket submitted successfully! You will receive a confirmation email at ${user?.email} shortly.`);
    setTicket({ subject: '', message: '', priority: 'medium', category: 'general' });
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { 
        sender: 'user', 
        message: newMessage, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setNewMessage('');

      // Simulate support response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: 'support',
          message: `Thank you for your message, ${getUserDisplayName()}. A support agent will assist you shortly.`,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 2000);
    }
  };

  // Show loading if no user
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              margin: '0 0 10px 0',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              🎧 Customer Care & Support
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
              Hello {getUserDisplayName()}, we're here to help you with SafePath
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            ← Back to SafePath
          </button>
        </div>

        {/* User Info Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <img 
            src={user?.photoURL || '/api/placeholder/50/50'} 
            alt="Profile"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '3px solid white'
            }}
          />
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>Account Information</h3>
            <p style={{ margin: '0 0 2px 0', fontSize: '14px' }}>Name: {getUserDisplayName()}</p>
            <p style={{ margin: '0 0 2px 0', fontSize: '14px' }}>Email: {user?.email}</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>User ID: {user?.uid?.substring(0, 12)}...</p>
          </div>
        </div>

        {/* Emergency Section */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8rem' }}>
            🚨 Emergency Support
          </h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📞 Call Emergency: 112
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🚨 Activate Panic Button
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📍 Share Live Location
            </button>
          </div>
        </div>

        {/* Support Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>

          {/* Phone Support */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            borderRadius: '15px',
            padding: '25px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>📞 Phone Support</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>24/7 Tourist Helpline</p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              1800-11-1363
            </div>
            <button style={{
              background: 'white',
              color: '#4facfe',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📞 Call Now
            </button>
          </div>

          {/* Live Chat */}
          <div style={{
            background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
            borderRadius: '15px',
            padding: '25px',
            color: '#333',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>💬 Live Chat</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Average response: 2 minutes</p>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>● </span>
              3 agents available
            </div>
            <button 
              onClick={() => setShowChat(!showChat)}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              💬 Start Chat
            </button>
          </div>

          {/* WhatsApp Support */}
          <div style={{
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            borderRadius: '15px',
            padding: '25px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>📱 WhatsApp Support</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Quick responses on WhatsApp</p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              +91-9876-543-210
            </div>
            <button style={{
              background: 'white',
              color: '#25d366',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📱 Chat on WhatsApp
            </button>
          </div>
        </div>

        {/* Live Chat Window */}
        {showChat && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '400px',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px',
              borderRadius: '15px 15px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>SafePath Support</span>
              <button 
                onClick={() => setShowChat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              background: '#f8f9fa'
            }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '18px',
                    background: msg.sender === 'user' ? '#667eea' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#333',
                    maxWidth: '80%',
                    fontSize: '14px'
                  }}>
                    {msg.message}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '4px'
                  }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex',
              padding: '15px',
              borderTop: '1px solid #eee'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  outline: 'none',
                  marginRight: '10px'
                }}
              />
              <button
                onClick={sendChatMessage}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer'
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Support Ticket Form */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          borderRadius: '15px',
          padding: '30px',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem' }}>🎫 Submit Support Ticket</h2>
          <form onSubmit={handleTicketSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({...ticket, category: e.target.value})}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(213, 8, 138, 0.9)'
                }}
              >
                <option value="general ">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="safety">Safety Concern</option>
                <option value="account">Account Problem</option>
                <option value="billing">Billing Question</option>
              </select>

              <select
                value={ticket.priority}
                onChange={(e) => setTicket({...ticket, priority: e.target.value})}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(213, 8, 138, 0.9)'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">🚨 Urgent</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Subject / Issue Title"
              value={ticket.subject}
              onChange={(e) => setTicket({...ticket, subject: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '16px',
                marginBottom: '20px',
                background: 'rgba(213, 8, 138, 0.9)',
                boxSizing: 'border-box'
              }}
            />

            <textarea
              placeholder="Describe your issue in detail..."
              value={ticket.message}
              onChange={(e) => setTicket({...ticket, message: e.target.value})}
              required
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '16px',
                marginBottom: '20px',
                resize: 'vertical',
                background: 'rgba(213, 8, 138, 0.9)',
                boxSizing: 'border-box'
              }}
            />

            <button
              type="submit"
              style={{
                background: 'white',
                color: '#f5576c',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎫 Submit Ticket
            </button>
          </form>
        </div>

        {/* Help Resources */}
        <div style={{
          marginTop: '40px',
          padding: '25px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>📚 Self-Help Resources</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              📖 User Guide
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              ❓ FAQ
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              🎥 Video Tutorials
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              🛡️ Safety Tips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;