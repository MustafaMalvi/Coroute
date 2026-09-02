import { useState } from 'react';
import LocationAutocomplete from './LocationAutocomplete';

const SearchFilter = ({ onSearch }) => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [minSeats, setMinSeats] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ pickup, dropoff, date, minSeats: minSeats ? Number(minSeats) : 0 });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-paper p-4 sm:p-5 rounded-2xl shadow-ticket border border-ink/10 -mt-10 relative z-10 max-w-4xl mx-auto space-y-3"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <LocationAutocomplete
            value={pickup}
            onChange={setPickup}
            placeholder="Leaving from (e.g., KKV Hall)"
            dotColor="text-route-500"
          />
        </div>

        <div className="flex-1">
          <LocationAutocomplete
            value={dropoff}
            onChange={setDropoff}
            placeholder="Going to (e.g., MU Hostel)"
            dotColor="text-alert-400"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-ink/10 px-4 py-2.5">
          <svg className="w-4 h-4 text-ink/35 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent outline-none text-ink text-sm font-medium"
          />
        </div>

        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-ink/10 px-4 py-2.5">
          <svg className="w-4 h-4 text-ink/35 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" /></svg>
          <select
            value={minSeats}
            onChange={(e) => setMinSeats(e.target.value)}
            className="w-full bg-transparent outline-none text-ink text-sm font-medium"
          >
            <option value="">Any seats needed</option>
            <option value="1">1+ seat</option>
            <option value="2">2+ seats</option>
            <option value="3">3+ seats</option>
          </select>
        </div>

        <button
          type="submit"
          className="md:w-auto w-full bg-ink hover:bg-ink-700 text-marigold-500 font-bold py-3 px-7 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Search
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>
    </form>
  );
};

export default SearchFilter;
