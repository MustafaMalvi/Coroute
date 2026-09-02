import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useMessageNotifications } from '../context/MessageNotificationsContext';

const Chat = () => {
  const { partnerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { refreshNow } = useMessageNotifications();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const passedPartnerName = location.state?.partnerName || 'Driver';

  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to chat');
      navigate('/login');
      return;
    }

    fetchMessages();
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [partnerId, user]);

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get(`/api/messages/${partnerId}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setMessages(res.data.messages);
      setPartner(res.data.partner);
      refreshNow();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
      if (showLoading) toast.error('Failed to load messages');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = newMessage;
    setNewMessage('');

    const optimisticMsg = {
      _id: Date.now(),
      sender: { _id: user.id },
      receiver: { _id: partnerId },
      content: tempMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      await api.post('/api/messages', { receiverId: partnerId, content: tempMessage }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchMessages(false);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-paper flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-route-500"></div>
      </div>
    );
  }

  const partnerDisplayPhone = partner?.phoneNumber;
  const partnerDisplayName = partner?.name || passedPartnerName;

  return (
    <div className="flex-1 bg-ink/[0.03] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto h-[82vh] bg-white rounded-2xl shadow-ticket border border-ink/10 flex flex-col overflow-hidden">

        <div className="bg-white border-b border-ink/10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/60">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-marigold-500/15 rounded-full flex items-center justify-center text-marigold-600 font-display text-base">
                {partnerDisplayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-ink">{partnerDisplayName}</h3>
                <span className="text-xs font-semibold text-route-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-route-500"></span> Active
                </span>
              </div>
            </div>
          </div>

          {partnerDisplayPhone && (
            <a
              href={`tel:${partnerDisplayPhone}`}
              aria-label={`Call ${partnerDisplayName}`}
              title={`Call ${partnerDisplayName}`}
              className="flex items-center gap-2 bg-route-50 hover:bg-route-100 text-route-600 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              Call
            </a>
          )}
        </div>

        <div className="flex-1 bg-paper/40 p-5 overflow-y-auto flex flex-col gap-3 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-marigold-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-marigold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-ink-600 font-medium">No messages yet.</p>
              <p className="text-ink/40 text-sm">Send a message to coordinate your ride!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => {
                const isMine = msg.sender._id === user.id || msg.sender === user.id;
                return (
                  <div key={msg._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMine ? 'bg-ink text-marigold-500 rounded-br-md' : 'bg-white border border-ink/10 text-ink rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className={`text-[10px] font-meter mt-1.5 block ${isMine ? 'text-marigold-500/50' : 'text-ink/35'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-ink/10 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-paper border border-ink/15 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-route-500 transition-all placeholder-ink/35"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-marigold-500 hover:bg-marigold-400 disabled:bg-ink/10 disabled:cursor-not-allowed text-ink p-3 rounded-full transition-all active:scale-95 flex items-center justify-center w-12 h-12 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
