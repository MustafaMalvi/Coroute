import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import HostDashboard from '../components/HostDashboard';
import PartnerDashboard from '../components/PartnerDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isHost = user?.role === 'host';

  return (
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">
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
