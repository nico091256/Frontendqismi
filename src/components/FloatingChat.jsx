import { useState, useEffect, useRef, useCallback } from 'react';
import { getChatMessages, sendChatMessage } from '../api/problems';
import toast from 'react-hot-toast';
import { 
  MessageSquare, X, Send, Bot, User, CheckCheck, Minimize2, 
  Maximize2, Sparkles, Zap, RefreshCw, Image, Paperclip
} from 'lucide-react';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen]);

  // Read current user
  useEffect(() => {
    try {
      const raw = localStorage.getItem('it_auth');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch messages from backend
  const fetchMessages = useCallback(async () => {
    try {
      const res = await getChatMessages();
      if (res.data?.messages) {
        const newMsgs = res.data.messages;
        if (newMsgs.length > prevMsgCountRef.current && prevMsgCountRef.current > 0 && !isOpenRef.current) {
          const diff = newMsgs.length - prevMsgCountRef.current;
          setUnreadCount(c => c + diff);
        }
        prevMsgCountRef.current = newMsgs.length;
        setMessages(newMsgs);
      }
    } catch {
      // background polling
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Compress image before setting to state
  const processImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setSelectedImage(dataUrl);
        toast.success("Rasm tayyorlandi 📸");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  // Support pasting image from clipboard (Ctrl + V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) processImageFile(blob);
        break;
      }
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!inputMsg.trim() && !selectedImage) || sending) return;

    const textToSend = inputMsg.trim();
    const imageToSend = selectedImage;

    setInputMsg('');
    setSelectedImage(null);
    setSending(true);

    const tempMsg = {
      id: Date.now(),
      senderId: currentUser?.id || 0,
      senderName: currentUser?.fullName || 'Men',
      senderRole: currentUser?.role || 'IT_SUPPORT',
      message: textToSend,
      image: imageToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await sendChatMessage(textToSend, imageToSend);
      if (res.data?.message) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
      }
    } catch {
      toast.error("Xabar yuborishda xatolik");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInputMsg(textToSend);
      setSelectedImage(imageToSend);
    } finally {
      setSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Only render if user is logged in
  if (!currentUser) return null;

  return (
    <>
      {/* ── Zoom Preview Modal ── */}
      {previewZoom && (
        <div 
          onClick={() => setPreviewZoom(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 300,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={previewZoom} 
            alt="Preview" 
            style={{ maxWidth: '92vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} 
          />
        </div>
      )}

      {/* ── Chat Pop-up Window ── */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 'clamp(320px, 92vw, 410px)',
          height: 'clamp(480px, 78vh, 580px)',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 150,
          overflow: 'hidden',
          animation: 'slideUp 0.22s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(30,41,59,0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                border: '1px solid rgba(59,130,246,0.4)',
                display: 'grid',
                placeItems: 'center'
              }}>
                <MessageSquare size={18} color="#60a5fa" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#fff' }}>IT Jamoa Chati</div>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bot size={11} /> Telegram botga ulanadi
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
              title="Yopish"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'radial-gradient(ellipse at bottom, rgba(30, 41, 59, 0.4) 0%, transparent 80%)'
          }}>
            
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                Xabarlar yo'q. Birinchi bo'lib yozing yoki rasm yuboring!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = (currentUser && msg.senderId === currentUser.id) || (msg.senderName === currentUser?.fullName);
                const isManager = msg.senderRole === 'MANAGER';

                return (
                  <div 
                    key={msg.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '100%'
                    }}
                  >
                    {!isMe && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2, paddingLeft: 2 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isManager ? '#f59e0b' : '#38bdf8' }}>
                          {msg.senderName}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          padding: '1px 4px',
                          borderRadius: 3,
                          background: isManager ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                          color: isManager ? '#fbbf24' : '#38bdf8'
                        }}>
                          {isManager ? 'Manager' : 'IT'}
                        </span>
                      </div>
                    )}

                    <div style={{
                      maxWidth: '85%',
                      padding: '8px 12px',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isMe 
                        ? 'linear-gradient(135deg, #2563eb, #3b82f6)' 
                        : 'rgba(30, 41, 59, 0.95)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      border: isMe ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.84rem',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {/* Attached Image if any */}
                      {msg.image && (
                        <div style={{ marginBottom: msg.message ? 6 : 2 }}>
                          <img 
                            src={msg.image} 
                            alt="Yuborilgan rasm" 
                            onClick={() => setPreviewZoom(msg.image)}
                            style={{
                              maxWidth: '100%',
                              maxHeight: 180,
                              borderRadius: 8,
                              display: 'block',
                              cursor: 'zoom-in',
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                        </div>
                      )}

                      {msg.message && <div>{msg.message}</div>}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 3,
                        marginTop: 3,
                        fontSize: '0.65rem',
                        color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                      }}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMe && <CheckCheck size={11} color="#a5f3fc" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Selected Image Preview (before sending) */}
          {selectedImage && (
            <div style={{
              padding: '6px 12px',
              background: 'rgba(30, 41, 59, 0.9)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={selectedImage} alt="Selected" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                <span style={{ fontSize: '0.74rem', color: '#38bdf8' }}>Rasm biriktirildi</span>
              </div>
              <button 
                onClick={() => setSelectedImage(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Bekor qilish"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Bottom Input */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '10px 12px',
              background: 'rgba(15, 23, 42, 0.98)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />

            {/* Photo Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: selectedImage ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                color: selectedImage ? '#38bdf8' : 'var(--text-secondary)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Rasm / Screenshot yuklash"
            >
              <Image size={17} />
            </button>

            <input
              type="text"
              className="form-input"
              placeholder="Xabar yozing (yoki rasm tashlang)..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onPaste={handlePaste}
              disabled={sending}
              style={{
                flex: 1,
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: '0.84rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)'
              }}
            />

            <button
              type="submit"
              disabled={(!inputMsg.trim() && !selectedImage) || sending}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: 'none',
                background: (inputMsg.trim() || selectedImage) ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: (inputMsg.trim() || selectedImage) ? 'pointer' : 'default',
                transition: 'all 0.15s',
                flexShrink: 0
              }}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

      {/* ── Floating Action Button (Bottom Right) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 140,
          padding: '12px 18px',
          borderRadius: 99,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 30px rgba(37,99,235,0.45)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="floating-chat-btn"
        title="IT Jamoa Chati"
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MessageSquare size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: 17,
              height: 17,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              border: '2px solid #0f172a'
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <span>IT Chat</span>
        {isOpen ? <X size={15} /> : <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />}
      </button>
    </>
  );
}
