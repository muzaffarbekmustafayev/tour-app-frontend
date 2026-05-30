import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiLock } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const ChatWidget = ({ hotelId, ownerId, hotelName }) => {
  const { user } = useContext(AuthContext);
  const { openConversation, unreadTotal } = useContext(ChatContext);
  const navigate = useNavigate();

  const isOwnerOfHotel = user && ownerId && (user._id === ownerId || user.id === ownerId);
  if (isOwnerOfHotel) return null;

  const handleClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    openConversation(hotelId, true);
  };

  return (
    <button
      onClick={handleClick}
      title={user ? `${hotelName} bilan suhbat` : 'Kirish kerak'}
      style={{
        position: 'fixed', bottom: 90, right: 20, zIndex: 400,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.55)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
      }}
    >
      {user ? <FiMessageCircle size={22} color="#fff" /> : <FiLock size={20} color="#fff" />}
      {user && unreadTotal > 0 && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          background: '#ef4444', color: '#fff',
          borderRadius: '50%', width: 20, height: 20,
          fontSize: '0.65rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff',
          animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        }}>
          {unreadTotal > 9 ? '9+' : unreadTotal}
        </span>
      )}
    </button>
  );
};

export default ChatWidget;
