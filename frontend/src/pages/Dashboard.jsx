import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import HostDashboard from '../components/HostDashboard';
import PartnerDashboard from '../components/PartnerDashboard';
import { heading, wrap } from '../styles/style';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isHost = user?.role === 'host';

  return (
    <div className={wrap.page}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className={heading.eyebrowRoute}>
            {isHost ? 'Ride Host' : 'Ride Partner'}
          </span>
          <h1 className="font-display text-3xl mt-2">
            {isHost ? 'Your driving dashboard' : 'Your travel dashboard'}
          </h1>
          <p className="text-ink-600 mt-2 text-sm">
            {isHost ? 'Track your rides, passengers, and earnings.' : 'Track your bookings, trips, and savings.'}
          </p>
        </div>

        {isHost ? <HostDashboard /> : <PartnerDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
