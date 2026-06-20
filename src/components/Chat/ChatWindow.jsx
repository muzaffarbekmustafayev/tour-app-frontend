import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import {
  FiX, FiSend, FiChevronDown, FiMessageCircle,
  FiWifiOff, FiChevronUp, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi';

const Avatar = ({ user, size = 32 }) => {
  if (user?.avatar) {
    return <img src={user.avatar} alt={user?.name || '?'}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  const initials = user?.name?.slice(0, 1)?.toUpperCase() || '?';
  const colors = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
  const bg = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.4,
    }}>{initials}</div>
  );
};

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%', background: '#a78bfa',
        animation: `dotBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

const Spinner = ({ size = 20, color = '#6366F1' }) => (
  <div style={{
    width: size, height: size, flexShrink: 0,
    border: `2.5px solid ${color}22`, borderTopColor: color,
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
);

const MsgStatus = ({ status, onRetry }) => {
  if (status === 'pending') {
    return <Spinner size={10} color="rgba(255,255,255,0.7)" />;
  }
  if (status === 'failed') {
    return (
      <button onClick={onRetry} title="Qayta yuborish"
        style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '0.6rem', padding: 0 }}>
        <FiAlertCircle size={10} />
        <FiRefreshCw size={9} />
      </button>
    );
  }
  return null;
};

const ChatWindow = () => {
  const { user } = useContext(AuthContext);
  const {
    activeConversation, messages, loadingMessages,
    closeConversation, sendMessage, sendTyping, retryMessage,
    chatOpen, typingUsers, socketConnected,
    hasMore, loadingMore, loadMoreMessages,
    onlineUsers,
  } = useContext(ChatContext);

  const [input, setInput]       = useState('');
  const [minimized, setMinimized] = useState(false);
  const [atBottom, setAtBottom]   = useState(true);
  const [newCount, setNewCount]   = useState(0);
  const messagesEndRef  = useRef(null);
  const scrollBoxRef    = useRef(null);
  const inputRef        = useRef(null);
  const prevScrollHeight = useRef(0);
  const prevMsgLen       = useRef(messages.length);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setNewCount(0);
  };

  const handleScroll = () => {
    const el = scrollBoxRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(near);
    if (near) setNewCount(0);
  };

  useEffect(() => {
    if (minimized) return;
    const grew = messages.length > prevMsgLen.current;
    prevMsgLen.current = messages.length;
    if (!grew) return;
    const last = messages[messages.length - 1];
    const lastIsMine = last && (last.sender?._id === (user?._id || user?.id) || last.sender === (user?._id || user?.id));
    if (atBottom || lastIsMine) { scrollToBottom('smooth'); }
    else { setNewCount(c => c + 1); }
  }, [messages.length, minimized]);

  useEffect(() => {
    if (loadingMore) {
      prevScrollHeight.current = scrollBoxRef.current?.scrollHeight || 0;
    } else if (prevScrollHeight.current && scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop += scrollBoxRef.current.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [loadingMore]);

  useEffect(() => {
    if (chatOpen && !minimized) setTimeout(() => inputRef.current?.focus(), 120);
  }, [chatOpen, minimized]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeConversation(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen, closeConversation]);

  if (!chatOpen || !activeConversation) return null;

  const myId    = user?._id || user?.id;
  const other   = activeConversation.participants?.find(p => p._id !== myId);
  const hotel   = activeConversation.hotel;
  const isTyping = typingUsers?.[activeConversation._id];
  const isOtherOnline = other && (onlineUsers.has(other._id) || onlineUsers.has(String(other._id)));

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };
  const handleInputChange = (e) => { setInput(e.target.value); sendTyping(); };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Bugun';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  };

  const grouped = [];
  let lastDate = '';
  for (const msg of messages) {
    const dateStr = formatDate(msg.createdAt);
    if (dateStr !== lastDate) {
      grouped.push({ type: 'date', label: dateStr, key: `date-${msg._id}` });
      lastDate = dateStr;
    }
    grouped.push({ type: 'message', msg, key: msg._id });
  }

  return (
    <>
      <style>{`
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); opacity:.4; } 30% { transform: translateY(-6px); opacity:1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes chatPop { 0% { opacity:0; transform: translateY(28px) scale(0.86); } 60% { opacity:1; transform: translateY(-4px) scale(1.01); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes chatHeaderGlow { 0%,100% { opacity:0.5; transform: translate(0,0) scale(1); } 50% { opacity:0.85; transform: translate(8px,-6px) scale(1.15); } }
        @keyframes onlinePulse { 0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); } 70% { box-shadow: 0 0 0 6px rgba(52,211,153,0); } 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); } }
        .chat-send-btn:hover:not(:disabled) { filter: brightness(1.1); transform: scale(1.06) rotate(-6deg); }
        .chat-hdr-btn:hover { background: rgba(255,255,255,0.28) !important; }
        .msg-retry:hover { opacity: .8; }
        @media (prefers-reduced-motion: reduce) { .chat-window-anim { animation: none !important; } }
      `}</style>

      <div className="chat-window-anim" style={{
        position: 'fixed', bottom: 90, right: 'max(16px, env(safe-area-inset-right))',
        width: 'min(370px, calc(100vw - 28px))',
        maxHeight: minimized ? 64 : 'min(540px, calc(100dvh - 140px))',
        borderRadius: '1.5rem',
        boxShadow: '0 24px 70px -12px rgba(99,102,241,0.38), 0 8px 24px -8px rgba(0,0,0,0.18)',
        background: 'var(--bg-card, #fff)',
        border: '1px solid var(--border, #e5e7eb)',
        display: 'flex', flexDirection: 'column',
        zIndex: 1100, overflow: 'hidden',
        transformOrigin: 'bottom right',
        animation: 'chatPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Header */}
        <div
          onClick={() => setMinimized(p => !p)}
          style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #8B5CF6 100%)',
            cursor: 'pointer', flexShrink: 0, userSelect: 'none',
          }}
        >
          <div style={{
            position: 'absolute', top: -28, right: -10, width: 110, height: 110,
            background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)',
            filter: 'blur(8px)', pointerEvents: 'none',
            animation: 'chatHeaderGlow 6s ease-in-out infinite',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ padding: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <Avatar user={other} size={38} />
            </div>
            <span style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: '50%',
              background: isOtherOnline ? '#34d399' : '#cbd5e1',
              border: '2px solid #6D28D9', transition: 'background 0.4s',
              animation: isOtherOnline ? 'onlinePulse 2s ease-out infinite' : 'none',
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {other?.name || 'Mehmonxona egasi'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem' }}>
              {isTyping ? (
                <span style={{ color: '#a5f3d4', fontWeight: 600 }}>yozmoqda...</span>
              ) : isOtherOnline ? (
                <span style={{ color: '#a5f3d4' }}>Online</span>
              ) : hotel?.name ? (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display:'block' }}>{hotel.name}</span>
              ) : 'Offline'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 5, zIndex: 1 }} onClick={e => e.stopPropagation()}>
            <button className="chat-hdr-btn" onClick={() => setMinimized(p => !p)} style={headerBtnStyle} title={minimized ? 'Kattalashtirish' : 'Kichraytirish'}>
              <FiChevronDown size={15} style={{ transform: minimized ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <button className="chat-hdr-btn" onClick={closeConversation} style={headerBtnStyle} title="Yopish">
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!minimized && (
          <>
            <div style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0 }}>
            <div
              ref={scrollBoxRef}
              onScroll={handleScroll}
              style={{
                flex: 1, overflowY: 'auto', padding: '8px 10px 4px',
                display: 'flex', flexDirection: 'column', gap: 2,
                background: 'var(--bg-hover, #f9fafb)',
                scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent',
              }}
            >
              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 4px' }}>
                  <button onClick={loadMoreMessages} disabled={loadingMore}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '2rem', padding: '5px 14px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', cursor: loadingMore ? 'not-allowed' : 'pointer' }}>
                    {loadingMore ? <Spinner size={14} /> : <FiChevronUp size={12} />}
                    {loadingMore ? 'Yuklanmoqda...' : 'Oldingi xabarlar'}
                  </button>
                </div>
              )}

              {loadingMessages ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:10, color:'var(--text-muted)', fontSize:'0.8rem', padding:'40px 0' }}>
                  <Spinner size={28} />
                  Yuklanmoqda...
                </div>
              ) : grouped.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:10, color:'var(--text-muted)', padding:'36px 24px', textAlign:'center', animation:'fadeUp 0.3s ease' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.14))', border:'1px solid rgba(99,102,241,0.2)' }}>
                    <FiMessageCircle size={28} style={{ color:'#8B5CF6' }} />
                  </div>
                  <div style={{ fontWeight:800, fontSize:'0.92rem', color:'var(--text-main)' }}>Suhbatni boshlang!</div>
                  <div style={{ fontSize:'0.76rem', opacity:0.75, maxWidth:210, lineHeight:1.55 }}>Mehmonxona egasiga savolingizni yozing — tez orada javob beradi.</div>
                </div>
              ) : (
                grouped.map(item => {
                  if (item.type === 'date') {
                    return (
                      <div key={item.key} style={{ display:'flex', alignItems:'center', gap:8, margin:'10px 0 6px', fontSize:'0.66rem', color:'var(--text-muted)', fontWeight:600 }}>
                        <div style={{ flex:1, height:1, background:'var(--border, #e5e7eb)' }} />
                        {item.label}
                        <div style={{ flex:1, height:1, background:'var(--border, #e5e7eb)' }} />
                      </div>
                    );
                  }
                  const { msg } = item;
                  const isMine = msg.sender?._id === myId || msg.sender === myId;
                  const isFailed  = msg.status === 'failed';
                  const isPending = msg.status === 'pending';
                  return (
                    <div key={item.key} style={{ display:'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems:'flex-end', gap:6, marginBottom:1, animation: 'fadeUp 0.18s ease', opacity: isPending ? 0.75 : isFailed ? 0.85 : 1 }}>
                      {!isMine && <Avatar user={msg.sender} size={24} />}
                      <div style={{ maxWidth: '75%' }}>
                        {!isMine && msg.sender?.name && (
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6366F1', marginBottom: 2, paddingLeft: 4 }}>
                            {msg.sender.name}
                          </div>
                        )}
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          background: isMine ? (isFailed ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)') : 'var(--bg-card, #fff)',
                          color: isMine ? '#fff' : 'var(--text-main)',
                          fontSize: '0.84rem', lineHeight: 1.5, wordBreak: 'break-word',
                          boxShadow: isMine ? '0 2px 10px rgba(99,102,241,0.28)' : '0 1px 4px rgba(0,0,0,0.07)',
                          border: isFailed ? '1px solid #fca5a5' : 'none',
                        }}>
                          <div>{msg.content}</div>
                          <div style={{ fontSize:'0.6rem', opacity:0.65, marginTop:3, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
                            {formatTime(msg.createdAt)}
                            {isMine && (
                              <>
                                {isFailed ? (
                                  <MsgStatus status="failed" onRetry={() => retryMessage(msg._tempId)} />
                                ) : isPending ? (
                                  <MsgStatus status="pending" />
                                ) : (
                                  <span style={{ fontSize:'0.7rem', color: msg.read ? '#a5f3d4' : 'rgba(255,255,255,0.6)' }}>
                                    {msg.read ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginTop:4, animation:'fadeUp 0.18s ease' }}>
                  <Avatar user={other} size={24} />
                  <div style={{ background:'var(--bg-card,#fff)', borderRadius:'4px 16px 16px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {!atBottom && (
              <button onClick={() => scrollToBottom('smooth')} title="Pastga tushish"
                style={{
                  position: 'absolute', bottom: 12, right: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, padding: newCount > 0 ? '0 12px 0 10px' : '0',
                  width: newCount > 0 ? 'auto' : 32, justifyContent: 'center',
                  borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: newCount > 0 ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'var(--bg-card, #fff)',
                  color: newCount > 0 ? '#fff' : 'var(--text-muted)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  fontSize: '0.74rem', fontWeight: 700, animation: 'fadeUp 0.2s ease',
                }}>
                <FiChevronDown size={16} />
                {newCount > 0 && `${newCount} yangi`}
              </button>
            )}
            </div>

            {!socketConnected && (
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:'#fef3c7', borderTop:'1px solid #fde68a', fontSize:'0.72rem', color:'#92400e', fontWeight:600 }}>
                <FiWifiOff size={12} />
                Ulanish yo'q — xabar REST orqali yuboriladi
              </div>
            )}

            <form onSubmit={handleSend} style={{ display:'flex', gap:8, padding:'8px 10px 10px', borderTop:'1px solid var(--border, #e5e7eb)', background:'var(--bg-card, #fff)', flexShrink:0, alignItems:'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing..."
                rows={1}
                maxLength={2000}
                style={{ flex:1, resize:'none', border:'1.5px solid var(--border, #e5e7eb)', borderRadius:'0.875rem', padding:'9px 12px', fontSize:'0.875rem', fontFamily:'inherit', background:'var(--bg-hover, #f9fafb)', color:'var(--text-main)', outline:'none', lineHeight:1.45, maxHeight:88, overflowY:'auto', transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = 'var(--border, #e5e7eb)'}
              />
              <button type="submit" disabled={!input.trim()} className="chat-send-btn"
                style={{ background: input.trim() ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'var(--border, #e5e7eb)', color: input.trim() ? '#fff' : 'var(--text-muted)', border:'none', borderRadius:'0.875rem', width:40, height:40, cursor: input.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.18s, transform 0.1s, filter 0.15s' }}>
                <FiSend size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
};

const headerBtnStyle = {
  color:'#fff', background:'rgba(255,255,255,0.15)',
  border:'none', borderRadius:'50%', width:28, height:28,
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
  transition:'background 0.15s',
};

export default ChatWindow;
