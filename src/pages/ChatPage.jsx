import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiMessageCircle, FiSearch, FiInbox } from 'react-icons/fi';

/* ─── Avatar ─────────────────────────────────────────── */
const Avatar = ({ user, size = 46 }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || '?'}
        style={{
          width: size, height: size,
          borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        }}
      />
    );
  }
  const initials = user?.name?.slice(0, 1)?.toUpperCase() || '?';
  const COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
  const bg = COLORS[(user?.name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.38, flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {initials}
    </div>
  );
};

/* ─── timeAgo ─────────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'hozir';
  if (mins < 60) return `${mins} daq`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} soat`;
  return `${Math.floor(hrs / 24)} kun`;
};

/* ─── Skeleton card ───────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 14px', borderRadius: '1rem',
    background: 'var(--bg-card, #fff)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }}>
    <div style={{
      width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
      background: 'var(--skeleton, #e5e7eb)',
      animation: 'skeletonPulse 1.4s ease-in-out infinite',
    }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{
        height: 13, width: '55%', borderRadius: 6,
        background: 'var(--skeleton, #e5e7eb)',
        animation: 'skeletonPulse 1.4s ease-in-out infinite',
      }} />
      <div style={{
        height: 11, width: '80%', borderRadius: 6,
        background: 'var(--skeleton, #e5e7eb)',
        animation: 'skeletonPulse 1.4s ease-in-out 0.2s infinite',
      }} />
    </div>
    <div style={{
      width: 30, height: 11, borderRadius: 6, flexShrink: 0,
      background: 'var(--skeleton, #e5e7eb)',
      animation: 'skeletonPulse 1.4s ease-in-out infinite',
    }} />
  </div>
);

/* ─── ChatPage ────────────────────────────────────────── */
const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const {
    conversations, openConversation,
    fetchConversations, unreadTotal,
  } = useContext(ChatContext);

  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchConversations();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const myId = user?._id || user?.id;

  const filtered = conversations.filter(conv => {
    const other = conv.participants?.find(p => p._id !== myId);
    const q = search.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(q) ||
      conv.hotel?.name?.toLowerCase().includes(q) ||
      conv.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Skeleton pulse keyframes */}
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .conv-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.09) !important; }
        .conv-card:active { transform: translateY(0) scale(0.99); }
      `}</style>

      <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
        <div className="max-w-lg mx-auto pt-4 pb-24 px-4">

          {/* ── Header ── */}
          <div className="mb-5 flex items-center gap-3">
            <BackButton />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>
                  Xabarlar
                </h1>
                {unreadTotal > 0 && (
                  <span style={{
                    background: '#6366F1', color: '#fff',
                    borderRadius: 50, padding: '2px 9px',
                    fontSize: '0.7rem', fontWeight: 800,
                    lineHeight: 1.5,
                  }}>
                    {unreadTotal > 99 ? '99+' : unreadTotal}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 1 }}>
                {loading ? 'Yuklanmoqda…' : `${conversations.length} ta suhbat`}
              </p>
            </div>
          </div>

          {/* ── Search ── */}
          <div className="relative mb-4">
            <FiSearch style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', width: 16, height: 16, pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Suhbat qidirish…"
              style={{
                width: '100%',
                paddingLeft: '2.6rem', paddingRight: '1rem',
                paddingTop: '0.72rem', paddingBottom: '0.72rem',
                background: 'var(--bg-card, #fff)',
                border: '1.5px solid var(--border)',
                borderRadius: '0.875rem',
                outline: 'none', color: 'var(--text-main)',
                fontSize: '0.875rem', fontFamily: 'inherit',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* ── Skeleton ── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && filtered.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '64px 20px',
              color: 'var(--text-muted)',
              animation: 'fadeSlideUp 0.35s ease both',
            }}>
              {search ? (
                <>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--bg-card, #fff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  }}>
                    <FiSearch size={26} style={{ opacity: 0.35 }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                    Suhbat topilmadi
                  </p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Boshqa kalit so'z kiriting
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <FiInbox size={30} style={{ color: '#6366F1', opacity: 0.75 }} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: 6 }}>
                    Hali suhbat yo'q
                  </p>
                  <p style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: 230, lineHeight: 1.5 }}>
                    Mehmonxona sahifasidan «Xabar yuborish» tugmasini bosib suhbat boshlang
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Conversation list ── */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              animation: 'fadeSlideUp 0.3s ease both',
            }}>
              {filtered.map((conv, idx) => {
                const other = conv.participants?.find(p => p._id !== myId);
                const unread = typeof conv.unreadCount === 'number'
                  ? conv.unreadCount
                  : (conv.unreadCount?.[myId] || 0);
                const hasUnread = unread > 0;

                return (
                  <button
                    key={conv._id}
                    className="conv-card"
                    onClick={() => openConversation(conv, false)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: '1rem',
                      border: 'none', cursor: 'pointer',
                      background: 'var(--bg-card, #fff)',
                      textAlign: 'left',
                      boxShadow: hasUnread
                        ? '0 2px 12px rgba(99,102,241,0.13)'
                        : '0 1px 5px rgba(0,0,0,0.06)',
                      borderLeft: `3px solid ${hasUnread ? '#6366F1' : 'transparent'}`,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      animation: `fadeSlideUp 0.3s ease ${idx * 0.04}s both`,
                    }}
                  >
                    {/* Avatar + badge */}
                    <div style={{ position: 'relative' }}>
                      <Avatar user={other} size={46} />
                      {hasUnread && (
                        <span style={{
                          position: 'absolute', top: -2, right: -2,
                          background: '#6366F1', color: '#fff',
                          borderRadius: '50%', width: 18, height: 18,
                          fontSize: '0.58rem', fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--bg-card, #fff)',
                        }}>
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 2,
                      }}>
                        <span style={{
                          fontWeight: hasUnread ? 800 : 600,
                          fontSize: '0.9rem', color: 'var(--text-main)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: 160,
                        }}>
                          {other?.name || 'Foydalanuvchi'}
                        </span>
                        <span style={{
                          fontSize: '0.7rem', color: 'var(--text-muted)',
                          flexShrink: 0, marginLeft: 8,
                        }}>
                          {timeAgo(conv.lastMessageAt)}
                        </span>
                      </div>

                      {conv.hotel?.name && (
                        <div style={{
                          fontSize: '0.68rem', color: '#6366F1', fontWeight: 700,
                          marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                          <FiMessageCircle size={10} />
                          {conv.hotel.name}
                        </div>
                      )}

                      <span style={{
                        fontSize: '0.79rem',
                        color: hasUnread ? 'var(--text-main)' : 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'block',
                        fontWeight: hasUnread ? 600 : 400,
                      }}>
                        {conv.lastMessage || 'Suhbat boshlandi'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ChatPage;
