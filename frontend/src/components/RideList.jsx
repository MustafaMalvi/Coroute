import RideCard from './RideCard';

const RideList = ({ rides, showSearchEmptyState = false }) => {
  if (rides.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-ink/15 mt-8">
        <svg className="w-20 h-20 mx-auto mb-5 text-ink/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h3 className="font-display text-base mb-1">
          {showSearchEmptyState ? 'No rides match your search' : 'No rides found'}
        </h3>
        <p className="text-ink-600 text-sm max-w-xs mx-auto">
          {showSearchEmptyState
            ? 'Try a different route, date, or lower the seat requirement.'
            : 'Try adjusting your search locations or check back later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 mt-8">
      {rides.map(ride => (
        <RideCard key={ride._id || ride.id} ride={ride} />
      ))}
    </div>
  );
};

export default RideList;
