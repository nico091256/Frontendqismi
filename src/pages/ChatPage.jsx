import { useState, useEffect, useRef, useCallback } from 'react';
import { getChatMessages, sendChatMessage } from '../api/problems';
import toast from 'react-hot-toast';
import { 
  Send, MessageSquare, Bot, User, Clock, Shield, RefreshCw, 
  Sparkles, CheckCheck, Smile, Paperclip, Users, Info, Zap
} from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const chatEndRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // Get current user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('it_auth');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch messages from backend
  const fetchMessages = useCallback(async (scroll = false) => {
    try {
      const res = await getChatMessages();
      if (res.data?.messages) {
        setMessages(res.data.messages);
        if (scroll || isFirstLoadRef.current) {
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          isFirstLoadRef.current = false;
        }
      }
    } catch {
      // ignore background polling error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-polling every 3 seconds
  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const textToSend = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    // Optimistic message
    const tempMsg = {
      id: Date.now(),
      senderId: currentUser?.id || 0,
      senderName: currentUser?.fullName || 'Men',
      senderRole: currentUser?.role || 'IT_SUPPORT',
      message: textToSend,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await sendChatMessage(textToSend);
      if (res.data?.message) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
      }
    } catch (err) {
      toast.error("Xabar yuborishda xatolik yuz berdi");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInputMsg(textToSend);
    } finally {
      setSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
    } catch {
      return '';
    }
  };

  return (
    <div className="page" style={{ paddingBottom: 24 }}>
      <div className="container" style={{ maxWidth: 900 }}>
        
        {/* ── Chat Container Card ── */}
        <div className="card" style={{ 
          padding: 0, 
          height: 'calc(100vh - 140px)', 
          minHeight: 520, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(59,130,246,0.3)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 15px rgba(59,130,246,0.2)'
              }}>
                <MessageSquare size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    IT Jamoa Chati
                  </h2>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'rgba(16,185,129,0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    Jonli (Live)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Bot size={13} color="#38bdf8" />
                  <span>Xabarlar Telegram botga ham avtomatik boradi</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                onClick={() => fetchMessages(true)} 
                className="btn btn-ghost btn-sm"
                title="Yangilash"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={13} className={loading ? "spin" : ""} />
                <span>Yangilash</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'radial-gradient(ellipse at bottom, rgba(30, 41, 59, 0.4) 0%, transparent 80%)'
          }}>
            
            {/* Telegram Notice Banner */}
            <div style={{
              margin: '0 auto 10px',
              padding: '8px 14px',
              borderRadius: 20,
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.76rem',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              maxWidth: 'fit-content'
            }}>
              <Zap size={13} />
              <span>Bu chat faqat IT mutaxassislar va Manager uchun. Yozilgan har bir xabar Telegram bot orqali uzatiladi.</span>
            </div>

            {messages.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', margin: 'auto' }}>
                <MessageSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <h4>Hozircha xabarlar yo'q</h4>
                <p style={{ fontSize: '0.84rem', marginTop: 4 }}>Jamoaga birinchi xabarni yozing!</p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isMe = (currentUser && msg.senderId === currentUser.id) || (msg.senderName === currentUser?.fullName);
              const isManager = msg.senderRole === 'MANAGER';

              return (
                <div 
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  {/* Sender Name & Role (only for others) */}
                  {!isMe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, paddingLeft: 4 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isManager ? '#f59e0b' : '#38bdf8' }}>
                        {msg.senderName}
                      </span>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: isManager ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                        color: isManager ? '#fbbf24' : '#38bdf8'
                      }}>
                        {isManager ? '👑 Manager' : 'IT Support'}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isMe 
                      ? 'linear-gradient(135deg, #2563eb, #3b82f6)' 
                      : 'rgba(30, 41, 59, 0.9)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    border: isMe ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border)',
                    boxShadow: isMe ? '0 4px 15px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}>
                    {msg.message}
                    
                    {/* Time & Checkmarks */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      marginTop: 4,
                      fontSize: '0.68rem',
                      color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                    }}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && <CheckCheck size={12} color={isMe ? '#a5f3fc' : 'inherit'} />}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Xabaringizni yozing (Enter bosing)..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={sending}
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: '0.9rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)'
              }}
              autoFocus
            />

            <button
              type="submit"
              disabled={!inputMsg.trim() || sending}
              className="btn btn-primary"
              style={{
                borderRadius: 12,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: inputMsg.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                cursor: inputMsg.trim() ? 'pointer' : 'default',
                opacity: inputMsg.trim() ? 1 : 0.6
              }}
            >
              <Send size={16} />
              <span className="hide-mobile">Yuborish</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
