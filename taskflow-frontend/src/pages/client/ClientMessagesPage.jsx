import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  FolderKanban,
  Hash,
  ShieldCheck,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';

const CHANNELS = [
  { id: 'GENERAL', label: 'General Discussion', desc: 'High-level project coordination & updates' },
  { id: 'MILESTONES', label: 'Milestones & Releases', desc: 'Deliverable demos, acceptance & feedback' },
  { id: 'CHANGE_REQUESTS', label: 'Scope & Change Requests', desc: 'Scope clarifications and budget inquiries' },
  { id: 'TECHNICAL', label: 'Technical & Architecture', desc: 'System specs and technical questions' }
];

const ClientMessagesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [selectedChannel, setSelectedChannel] = useState('GENERAL');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedProjectId, selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      const paramId = searchParams.get('projectId');
      if (paramId && list.some(p => String(p.projectId) === String(paramId))) {
        setSelectedProjectId(paramId);
      } else if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].projectId);
      } else if (list.length === 0) {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await api.get(`/projects/${selectedProjectId}/messages`, {
        params: { channel: selectedChannel }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !selectedProjectId) return;

    setSending(true);
    setError('');
    try {
      const res = await api.post(`/projects/${selectedProjectId}/messages`, {
        content: inputText.trim(),
        channel: selectedChannel,
        isClientVisible: true
      });
      setInputText('');
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const currentProject = projects.find((p) => p.projectId === selectedProjectId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: '0 0 0.25rem' }}>
            Client Communication Hub
          </h1>
          <p style={{ color: '#666666', fontSize: '0.88rem', margin: 0 }}>
            Direct, real-time communication channel with your appointed Project Manager and lead team.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {projects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600, minWidth: '220px' }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} — {p.projectName}
                </option>
              ))}
            </select>
          )}

          {selectedProjectId && (
            <Link
              to={`/client/projects/${selectedProjectId}?tab=messages`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
            >
              <FolderKanban size={14} /> Open in Project Hub
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#c92a2a', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Main Chat Layout */}
      <div className="card" style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden', padding: 0 }}>
        {/* Left Channel Sidebar */}
        <div style={{ borderRight: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.2rem' }}>
              {currentProject ? currentProject.projectName : 'Selected Project'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.15rem' }}>
              PM: <strong>{currentProject?.projectManagerName || 'Sarah Jenkins'}</strong>
            </div>
          </div>

          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.35rem 0.5rem' }}>
              Channels
            </div>
            {CHANNELS.map((ch) => {
              const isActive = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    backgroundColor: isActive ? '#2b2b2b' : 'transparent',
                    color: isActive ? '#ffffff' : '#4d4d4d',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.84rem',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Hash size={15} color={isActive ? '#ffffff' : '#8c8c8c'} />
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid #e5e5e5', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#666666' }}>
            <ShieldCheck size={16} color="#2b2b2b" />
            <span>Encrypted tenant isolation</span>
          </div>
        </div>

        {/* Right Chat Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
          {/* Channel Bar */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hash size={18} color="#2b2b2b" />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b2b2b' }}>
                  {CHANNELS.find((c) => c.id === selectedChannel)?.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>
                  {CHANNELS.find((c) => c.id === selectedChannel)?.desc}
                </div>
              </div>
            </div>

            <button
              onClick={fetchMessages}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c', padding: '0.35rem' }}
              title="Refresh conversation"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.88rem' }}>
                Connecting to project channel...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2b2b2b' }}>No messages in this channel</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Start the conversation with your Project Manager below.</div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.userId;
                return (
                  <div
                    key={m.messageId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', fontSize: '0.75rem', color: '#8c8c8c' }}>
                      <strong style={{ color: '#2b2b2b' }}>{m.senderName}</strong>
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', backgroundColor: '#f0f0f0', color: '#4d4d4d', borderRadius: '4px', fontWeight: 600 }}>
                        {m.senderRole}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isMe ? '#2b2b2b' : '#f4f4f4',
                        color: isMe ? '#ffffff' : '#2b2b2b',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#fafafa'
            }}
          >
            <input
              type="text"
              placeholder={`Message #${CHANNELS.find((c) => c.id === selectedChannel)?.label}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="form-control"
              style={{ flex: 1, fontSize: '0.88rem', padding: '0.6rem 0.85rem' }}
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1.15rem' }}
            >
              <Send size={15} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientMessagesPage;
