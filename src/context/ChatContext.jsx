import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const ChatContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Suhbatlarni lastMessageAt bo'yicha tartiblash
const sortConvs = (list) =>
  [...list].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socketRef    = useRef(null);
  const activeConvRef = useRef(null); // socket handler'larda sync ref

  const [conversations,      setConversations]      = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages,           setMessages]           = useState([]);
  const [nextCursor,         setNextCursor]         = useState(null);
  const [hasMore,            setHasMore]            = useState(false);
  const [unreadTotal,        setUnreadTotal]        = useState(0);
  const [chatOpen,           setChatOpen]           = useState(false);
  const [loadingMessages,    setLoadingMessages]    = useState(false);
  const [loadingMore,        setLoadingMore]        = useState(false);
  const [typingUsers,        setTypingUsers]        = useState({});
  const [socketConnected,    setSocketConnected]    = useState(false);
  const [onlineUsers,        setOnlineUsers]        = useState(new Set());

  const typingTimers    = useRef({});
  const typingTimeout   = useRef(null);
  const lastTypingEmit  = useRef(0); // throttle uchun oxirgi emit vaqti

  // activeConvRef ni sinxron ushlab turish
  useEffect(() => { activeConvRef.current = activeConversation; }, [activeConversation]);

  // ── Socket.io ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      setOnlineUsers(new Set());
      return;
    }

    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      // Backend socket.io shu path'da: reverse-proxy faqat `/api` ni uzatadi
      path: '/api/socket.io/',
      auth: { token },
      // Polling birinchi — nginx websocket "upgrade" sozlanmagan bo'lsa ham ishlaydi
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // ── Ulanish / uzilish ──────────────────────────────────────────────────
    socket.on('connect', () => {
      setSocketConnected(true);
      // Reconnect bo'lganda faol suhbat xonasiga qayta qo'shilish
      const conv = activeConvRef.current;
      if (conv) socket.emit('join_conversation', conv._id);
    });
    socket.on('disconnect', () => setSocketConnected(false));

    // ── Yangi xabar (boshqalardan) ─────────────────────────────────────────
    socket.on('new_message', (message) => {
      const myId = user?._id || user?.id;
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, { ...message, status: 'sent' }];
      });
      setConversations(prev =>
        sortConvs(prev.map(conv =>
          conv._id === message.conversation
            ? { ...conv, lastMessage: message.content, lastMessageAt: message.createdAt }
            : conv
        ))
      );
      if (message.sender?._id !== myId && message.sender !== myId) {
        setUnreadTotal(p => p + 1);
      }
    });

    // ── Suhbat yangilandi (unread badge) ──────────────────────────────────
    socket.on('conversation_update', ({ conversationId, lastMessage, lastMessageAt, unreadCount }) => {
      setConversations(prev => {
        const exists = prev.some(c => c._id === conversationId);
        if (!exists) {
          // Yangi suhbat — to'liq ro'yxatni qayta yuklash
          fetchConversations();
          return prev;
        }
        return sortConvs(prev.map(conv =>
          conv._id === conversationId
            ? { ...conv, lastMessage, lastMessageAt, unreadCount: unreadCount ?? conv.unreadCount }
            : conv
        ));
      });
      fetchUnreadCount();
    });

    // ── O'qildi belgisi ────────────────────────────────────────────────────
    socket.on('messages_read', ({ conversationId }) => {
      setMessages(prev =>
        prev.map(m => m.conversation === conversationId ? { ...m, read: true } : m)
      );
    });

    // ── Yozmoqda ... ──────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId, userId }) => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: { userId } }));
      clearTimeout(typingTimers.current[conversationId]);
      typingTimers.current[conversationId] = setTimeout(() => {
        setTypingUsers(prev => { const n = { ...prev }; delete n[conversationId]; return n; });
      }, 3000);
    });
    socket.on('stop_typing', ({ conversationId }) => {
      setTypingUsers(prev => { const n = { ...prev }; delete n[conversationId]; return n; });
    });

    // ── Online holat ───────────────────────────────────────────────────────
    socket.on('user_online',  ({ userId }) => setOnlineUsers(p => new Set([...p, userId])));
    socket.on('user_offline', ({ userId }) => setOnlineUsers(p => { const n = new Set(p); n.delete(userId); return n; }));

    socket.on('error', (err) => console.warn('[socket error]', err));

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [user]);

  // ── API yordamchi funksiyalari ────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/chat/conversations');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setConversations(sortConvs(list));
    } catch {}
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/chat/conversations/unread');
      setUnreadTotal(res.data.unread ?? 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) { fetchConversations(); fetchUnreadCount(); }
    else { setConversations([]); setUnreadTotal(0); }
  }, [user, fetchConversations, fetchUnreadCount]);

  // ── Suhbat ochish ─────────────────────────────────────────────────────────
  const openConversation = useCallback(async (conversationOrHotelId, isHotelId = false) => {
    try {
      let conversation;
      if (isHotelId) {
        const res = await api.post(`/chat/conversations/hotel/${conversationOrHotelId}`);
        conversation = res.data;
      } else {
        conversation = conversationOrHotelId;
      }

      setActiveConversation(conversation);
      setChatOpen(true);
      setLoadingMessages(true);
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);

      socketRef.current?.emit('join_conversation', conversation._id);

      const res = await api.get(`/chat/conversations/${conversation._id}/messages?limit=30`);
      const payload = res.data;
      if (payload?.messages) {
        setMessages(payload.messages.map(m => ({ ...m, status: 'sent' })));
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(payload.hasMore ?? false);
      } else {
        setMessages(Array.isArray(payload) ? payload.map(m => ({ ...m, status: 'sent' })) : []);
      }

      socketRef.current?.emit('mark_read', conversation._id);

      const myId = user?._id || user?.id;
      const unread = typeof conversation.unreadCount === 'number'
        ? conversation.unreadCount
        : (conversation.unreadCount?.[myId] ?? 0);
      setUnreadTotal(p => Math.max(0, p - unread));

      await fetchConversations();
    } catch (err) {
      console.error('openConversation error:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user, fetchConversations]);

  // ── Eski xabarlarni yuklash (cursor pagination) ───────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMore || !nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await api.get(
        `/chat/conversations/${activeConversation._id}/messages?limit=30&before=${nextCursor}`
      );
      const payload = res.data;
      if (payload?.messages) {
        setMessages(prev => [
          ...payload.messages.map(m => ({ ...m, status: 'sent' })),
          ...prev,
        ]);
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(payload.hasMore ?? false);
      }
    } catch (err) {
      console.error('loadMoreMessages error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversation, hasMore, nextCursor, loadingMore]);

  const closeConversation = useCallback(() => {
    if (activeConversation) {
      socketRef.current?.emit('leave_conversation', activeConversation._id);
    }
    setChatOpen(false);
    setActiveConversation(null);
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);
  }, [activeConversation]);

  // ── Xabar yuborish — optimistic update + socket ACK ──────────────────────
  const sendMessage = useCallback((content, type = 'text') => {
    if (!activeConversation || !content?.trim()) return;

    const myId  = user?._id || user?.id;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // 1. Darhol UI ga qo'shish (pending holat)
    const optimistic = {
      _id:          tempId,
      _tempId:      tempId,
      conversation: activeConversation._id,
      sender:       { _id: myId, name: user?.name, avatar: user?.avatar || user?.profileImage },
      content:      content.trim(),
      type,
      createdAt:    new Date().toISOString(),
      read:         false,
      status:       'pending',
    };
    setMessages(prev => [...prev, optimistic]);

    if (socketRef.current?.connected) {
      // 2a. Socket + ACK
      socketRef.current.emit(
        'send_message',
        { conversationId: activeConversation._id, content: content.trim(), type, tempId },
        (ack) => {
          if (ack?.ok && ack.message) {
            // Temp → haqiqiy xabar bilan almashtirish
            setMessages(prev =>
              prev.map(m => m._tempId === tempId ? { ...ack.message, status: 'sent' } : m)
            );
            // Conversation listni yangilash
            setConversations(prev =>
              sortConvs(prev.map(conv =>
                conv._id === activeConversation._id
                  ? { ...conv, lastMessage: content.trim(), lastMessageAt: new Date().toISOString() }
                  : conv
              ))
            );
          } else {
            // Yuborishda xato — 'failed' deb belgilash
            setMessages(prev =>
              prev.map(m => m._tempId === tempId ? { ...m, status: 'failed' } : m)
            );
          }
        }
      );
    } else {
      // 2b. Socket yo'q — REST fallback
      api.post('/chat/messages', {
        conversationId: activeConversation._id,
        content: content.trim(),
        type,
      }).then(res => {
        setMessages(prev =>
          prev.map(m => m._tempId === tempId ? { ...res.data, status: 'sent' } : m)
        );
      }).catch(() => {
        setMessages(prev =>
          prev.map(m => m._tempId === tempId ? { ...m, status: 'failed' } : m)
        );
      });
    }
  }, [activeConversation, user]);

  // ── Muvaffaqiyatsiz xabarni qayta yuborish ────────────────────────────────
  const retryMessage = useCallback((tempId) => {
    const msg = messages.find(m => m._tempId === tempId);
    if (!msg) return;
    setMessages(prev => prev.filter(m => m._tempId !== tempId));
    sendMessage(msg.content, msg.type);
  }, [messages, sendMessage]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const sendTyping = useCallback(() => {
    if (!activeConversation || !socketRef.current?.connected) return;
    // Throttle: har bosishda emas, ko'pi bilan 1.5s da bir marta 'typing' yuborish
    const now = Date.now();
    if (now - lastTypingEmit.current > 1500) {
      lastTypingEmit.current = now;
      socketRef.current.emit('typing', { conversationId: activeConversation._id });
    }
    // 2s harakatsizlikdan keyin 'stop_typing'
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      lastTypingEmit.current = 0;
      socketRef.current?.emit('stop_typing', { conversationId: activeConversation._id });
    }, 2000);
  }, [activeConversation]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      hasMore,
      loadingMore,
      unreadTotal,
      chatOpen,
      loadingMessages,
      typingUsers,
      socketConnected,
      onlineUsers,
      openConversation,
      closeConversation,
      sendMessage,
      retryMessage,
      sendTyping,
      loadMoreMessages,
      fetchConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
