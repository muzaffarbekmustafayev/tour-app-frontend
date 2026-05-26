import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiX, FiSend, FiCheck, FiLock } from 'react-icons/fi';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ChatWidget = ({ hotelId, ownerId, hotelName }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // If the user is the owner of this hotel, they shouldn't chat with themselves
  const isOwnerOfHotel = user && ownerId && user._id === ownerId;

  // Poll for unread count or check for new messages when closed/open
  useEffect(() => {
    if (!user || isOwnerOfHotel) return;

    const checkNewMessages = async () => {
      try {
        const res = await api.get(`/chat/history/${hotelId}`);
        const chatMsgs = res.data;
        
        // Update messages
        setMessages(chatMsgs);

        // Count unread messages received from owner
        const unreads = chatMsgs.filter(m => m.sender._id === ownerId && !m.isRead).length;
        setUnreadCount(unreads);
      } catch (err) {
        console.error('Chat polling error:', err);
      }
    };

    // Initial check
    checkNewMessages();

    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(checkNewMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [hotelId, ownerId, user, isOwnerOfHotel]);

  // Scroll to bottom whenever messages list changes or widget opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Mark as read when widget is opened
      if (unreadCount > 0) {
        markMessagesAsRead();
      }
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    try {
      await api.post(`/chat/read/${hotelId}/${ownerId}`);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue('');

    // Optimistic UI update
    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: user._id, name: user.name },
      receiver: { _id: ownerId },
      hotel: hotelId,
      content: messageText,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const res = await api.post('/chat/send', {
        hotelId,
        receiverId: ownerId,
        content: messageText
      });
      
      // Replace the optimistic message with the real one from backend
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  if (isOwnerOfHotel) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[400] font-sans">
      {/* ── Chat Toggle Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 animate-bounce hover:shadow-indigo-500/30"
          style={{ background: 'var(--gradient-main, linear-gradient(135deg, #4f46e5, #6366f1))' }}
        >
          <FiMessageCircle className="text-2xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 text-white shadow-md shrink-0"
            style={{ background: 'var(--gradient-main, linear-gradient(135deg, #4f46e5, #6366f1))' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg border border-white/10 uppercase">
                  {hotelName ? hotelName.substring(0, 2) : 'HT'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight max-w-[200px] truncate">{hotelName}</h4>
                <p className="text-[10px] text-indigo-100 font-medium">Mehmonxona egasi</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            {!user ? (
              // Guest Mode / Not Logged In
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <FiLock className="text-2xl" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Shaxsiy xabar almashish
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Mehmonxona egasi bilan bevosita bog'lanish va savollar berish uchun tizimga kiring.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-102 active:scale-98"
                  style={{ background: 'var(--gradient-main)' }}
                >
                  Kirish / Registratsiya
                </button>
              </div>
            ) : messages.length === 0 ? (
              // Empty Conversation
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 dark:text-slate-600">
                <FiMessageCircle className="text-4xl mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">Suhbatni boshlang</p>
                <p className="text-[10px] opacity-80 mt-1 max-w-[200px]">
                  Mehmonxona egasiga narxlar, sharoitlar yoki bronlash haqida savol yo'llang.
                </p>
              </div>
            ) : (
              // Messages List
              messages.map((msg) => {
                const isOwn = msg.sender._id === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group ${
                        isOwn
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'
                      }`}
                    >
                      <p className="break-words leading-relaxed font-medium">{msg.content}</p>
                      
                      {/* Meta information row (time + receipt) inside bubble */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] select-none opacity-70 ${
                          isOwn ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOwn && (
                          <span className="inline-flex">
                            {msg.isRead ? (
                              <span className="flex text-emerald-300 font-bold" title="O'qildi">
                                <FiCheck className="w-3 h-3" />
                                <FiCheck className="w-3 h-3 -ml-1.5" />
                              </span>
                            ) : (
                              <span className="text-indigo-300" title="Yuborildi">
                                <FiCheck className="w-3 h-3" />
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form (Only for logged in users) */}
          {user && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Xabaringizni yozing..."
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-0 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md hover:shadow-indigo-500/20"
                style={{ background: 'var(--gradient-main, linear-gradient(135deg, #4f46e5, #6366f1))' }}
              >
                <FiSend className="text-sm" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
