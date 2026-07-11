import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchInbox = async () => {
      try {
        const res = await api.get('/api/messages', { headers: { Authorization: `Bearer ${user.token}` } });
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to fetch inbox', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [user, navigate]);

  return (
    <div className="flex-1 bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl mb-8">Messages</h2>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div></div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-ink/15 p-12 text-center">
            <p className="text-ink-600 text-lg">Your inbox is empty.</p>
            <p className="text-ink/40 mt-2 text-sm">Book a ride or offer a seat to start chatting!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden flex flex-col divide-y divide-ink/10">
            {conversations.map((conv, idx) => (
              <Link
                key={idx}
                to={`/chat/${conv.partner._id}`}
                state={{ partnerName: conv.partner.name }}
                className="p-4 sm:p-5 hover:bg-paper/60 transition-colors flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-marigold-500/15 rounded-full flex items-center justify-center text-marigold-600 font-display text-lg flex-shrink-0">
                  {conv.partner.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-ink truncate">{conv.partner.name}</h3>
                    <span className="text-xs font-meter text-ink/40 ml-2 flex-shrink-0">
                      {new Date(conv.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                        ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(conv.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`truncate text-sm ${conv.isUnread ? 'font-bold text-ink' : 'text-ink-600'}`}>{conv.latestMessage}</p>
                </div>
                {conv.isUnread && <div className="w-2.5 h-2.5 bg-marigold-500 rounded-full flex-shrink-0"></div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
