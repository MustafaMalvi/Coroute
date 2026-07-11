import { useContext, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';

const LiveMap = lazy(() => import('../components/mapbox'));

const TrackRide = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Live position</span>
          <h1 className="font-display text-3xl mt-2">Track my ride</h1>
          <p className="text-ink-600 mt-2 text-sm">See your real-time location on the map while you're on the move.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-ink rounded-full flex items-center justify-center text-marigold-500 font-display text-lg">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-ink">{user?.name || 'Student'}</p>
            <p className="text-sm text-ink-600 flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-route-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-route-500"></span>
              </span>
              Live tracking active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-4 sm:p-6">
          <Suspense fallback={
            <div className="h-72 sm:h-[28rem] w-full rounded-2xl flex items-center justify-center bg-ink/[0.03] border border-ink/10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div>
            </div>
          }>
            <LiveMap />
          </Suspense>
        </div>

        <div className="mt-6 bg-marigold-50 border border-marigold-100 rounded-xl p-4 text-sm text-marigold-700">
          <p className="font-bold mb-1">Tips for accurate tracking</p>
          <ul className="list-disc list-inside space-y-1 text-marigold-600">
            <li>Make sure GPS / Location Services are enabled on your device.</li>
            <li>For best accuracy, use your phone's browser while on the move.</li>
            <li>The map updates automatically as you move — no need to refresh.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrackRide;
