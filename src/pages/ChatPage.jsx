import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { FiSend, FiInfo } from 'react-icons/fi';

const ChatPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages and booking
    api.get(`/messages/${bookingId}`)
      .then(res => {
        setBooking(res.data.booking);
        setMessages(res.data.messages);
        setLoading(false);
        // Mark as read immediately on open
        api.patch(`/messages/${bookingId}/read`).catch(console.error);
      })
      .catch(err => {
        console.error(err);
        setError('Xabarlarni yuklashda xatolik yuz berdi.');
        setLoading(false);
      });
  }, [bookingId]);

  useEffect(() => {
    if (!socket || !bookingId) return;

    socket.emit('join_booking', bookingId);

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      // If we are actively looking at it, mark this new message as read immediately
      if (msg.receiver === user?.id || msg.receiver?._id === user?.id) {
        api.patch(`/messages/${bookingId}/read`).catch(console.error);
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, bookingId, user]);

  useEffect(() => {
    // Scroll to bottom whenever messages array changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || !booking) return;

    const currentUserId = user?.id || user?._id;
    // Determine receiver
    // If user is the booking customer, receiver is hotel owner
    // If user is hotel owner, receiver is booking customer
    let receiverId;
    if (currentUserId === booking.user._id) {
       receiverId = booking.hotel.owner?._id || booking.hotel.owner;
    } else {
       receiverId = booking.user._id;
    }

    if (!receiverId) {
      alert("Qabul qiluvchini aniqlab bo'lmadi.");
      return;
    }

    const tempContent = inputVal;
    setInputVal('');

    try {
      await api.post('/messages', {
        bookingId,
        receiverId,
        content: tempContent
      });
      // The message will come back via the socket 'receive_message' event,
      // so we don't necessarily need to push it here, but doing it makes it instanenous
      // Usually socket handles it immediately anyway.
    } catch (err) {
      console.error(err);
      alert('Xabar yuborishda xatolik yuz berdi.');
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !booking) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{error || "Bron topilmadi"}</h2>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">Orqaga qaytish</button>
    </div>
  );

  const currentUserId = user?.id || user?._id;
  const isCustomer = currentUserId === booking.user._id;
  const chatPartnerName = isCustomer ? (booking.hotel?.name + " (Boshqaruvchi)") : booking.user?.name;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50 dark:bg-slate-900 relative">
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-4 md:py-5 flex items-center shadow-sm">
        <BackButton className="mr-4 static bg-gray-100 dark:bg-slate-800" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white truncate">{chatPartnerName}</h1>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1.5 line-clamp-1">
             <FiInfo className="w-3.5 h-3.5 shrink-0" /> Bron #{booking._id.substring(booking._id.length - 6)}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[90px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
               <FiSend className="w-6 h-6 text-blue-300 dark:text-blue-600" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Muloqotni boshlang</h3>
            <p className="text-gray-500 text-sm">Bron haqidagi savollaringizni shu yerdan berishingiz mumkin.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = (msg.sender?._id || msg.sender) === currentUserId;
            const time = new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            
            // basic grouping (show time only if prev message is far away)
            const showTime = true; 

            return (
              <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-[1.5rem] px-5 py-3 ${
                  isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                </div>
                {showTime && (
                  <span className="text-[10px] text-gray-400 mt-1.5 font-bold px-1.5">{time}</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 md:bottom-auto w-full max-w-2xl bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 shrink-0 pb-8 md:pb-4 z-40">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Xabar yozing..."
            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-14 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white flex items-center justify-center rounded-2xl transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            <FiSend className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
