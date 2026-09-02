import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { AuthContext } from './AuthContext';

const POLL_INTERVAL_MS = 15000;

export const MessageNotificationsContext = createContext({ unreadCount: 0 });

export const useMessageNotifications = () => useContext(MessageNotificationsContext);

export const MessageNotificationsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const seenTimestamps = useRef(new Map());
  const isFirstPoll = useRef(true);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/messages', { headers: { Authorization: `Bearer ${user.token}` } });
      const conversations = res.data;

      setUnreadCount(conversations.filter((c) => c.isUnread).length);

      conversations.forEach((conv) => {
        const partnerId = conv.partner._id;
        const lastSeen = seenTimestamps.current.get(partnerId);
        const messageTime = new Date(conv.timestamp).getTime();

        if (conv.isUnread && !isFirstPoll.current && (!lastSeen || messageTime > lastSeen)) {
          toast.info(
            `💬 New message from ${conv.partner.name}: "${conv.latestMessage.slice(0, 60)}${conv.latestMessage.length > 60 ? '…' : ''}"`,
            { onClick: () => navigate(`/chat/${partnerId}`, { state: { partnerName: conv.partner.name } }) }
          );
        }

        seenTimestamps.current.set(partnerId, messageTime);
      });

      isFirstPoll.current = false;
    } catch (err) {
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      seenTimestamps.current.clear();
      isFirstPoll.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [user, poll]);

  const refreshNow = useCallback(() => poll(), [poll]);

  return (
    <MessageNotificationsContext.Provider value={{ unreadCount, refreshNow }}>
      {children}
    </MessageNotificationsContext.Provider>
  );
};