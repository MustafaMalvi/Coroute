import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

const Field = ({ label, value }) => (
  <div className="bg-paper p-4 rounded-xl border border-ink/10">
    <span className="block text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-ink font-medium">{value || '—'}</span>
  </div>
);

const StarRating = ({ value }) => (
  <div className="flex items-center gap-1" aria-label={`Rating: ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-marigold-500' : 'text-ink/15'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
      </svg>
    ))}
  </div>
);

const Profile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '', email: '', phoneNumber: '', gender: '', dob: '', studentId: '',
    college: '', bio: '', avatarUrl: '', rating: 5,
    emergencyContact: { name: '', phoneNumber: '' },
    vehicle: { number: '', type: '', model: '', color: '' },
  });
  const [stats, setStats] = useState({ offered: 0, booked: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, [user.token]);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/api/users/profile', { headers: { Authorization: `Bearer ${user.token}` } });
      setProfileData({
        name: res.data.name || '',
        email: res.data.email || '',
        phoneNumber: res.data.phoneNumber || '',
        gender: res.data.gender || '',
        dob: res.data.dob ? res.data.dob.split('T')[0] : '',
        studentId: res.data.studentId || '',
        college: res.data.college || 'Marwadi University',
        bio: res.data.bio || '',
        avatarUrl: res.data.avatarUrl || '',
        rating: res.data.rating ?? 5,
        emergencyContact: res.data.emergencyContact || { name: '', phoneNumber: '' },
        vehicle: res.data.vehicle || { number: '', type: '', model: '', color: '' },
      });
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/users/history', { headers: { Authorization: `Bearer ${user.token}` } });
      setStats({ offered: res.data.offeredRides.length, booked: res.data.bookedRides.length });
    } catch (err) {
      // Non-critical — stats simply stay at 0
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 1.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfileData(prev => ({ ...prev, avatarUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/users/profile', profileData, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return <div className="flex-1 flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div></div>;
  }

  return (
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-ink/10 overflow-hidden">

          <div className="livery-bg px-8 py-10 text-paper text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-marigold-500 rounded-full flex items-center justify-center font-display text-3xl text-ink overflow-hidden">
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  profileData.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-ink border-2 border-paper rounded-full flex items-center justify-center hover:bg-ink-700 transition-colors"
                  aria-label="Change avatar"
                >
                  <svg className="w-4 h-4 text-marigold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3.5" /></svg>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h2 className="font-display text-3xl">{profileData.name || 'User Profile'}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-marigold-500/20 text-marigold-400">
                  {user.role === 'host' ? 'Ride Host' : 'Ride Partner'}
                </span>
              </div>
              <p className="text-paper/60 mt-1 text-sm">{profileData.email}</p>
              <div className="mt-2 flex justify-center sm:justify-start">
                <StarRating value={profileData.rating} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-ink/10 border-b border-ink/10 bg-paper/40">
            <div className="p-4 text-center">
              <p className="font-display text-xl">{stats.offered}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink/40 font-bold mt-0.5">Rides Offered</p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-xl">{stats.booked}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink/40 font-bold mt-0.5">Seats Booked</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {!isEditing ? (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" value={profileData.name} />
                  <Field label="GR / Student ID" value={profileData.studentId} />
                  <Field label="Phone Number" value={profileData.phoneNumber} />
                  <Field label="Gender" value={profileData.gender} />
                  <Field label="College" value={profileData.college} />
                  <Field label="Date of Birth" value={profileData.dob ? new Date(profileData.dob).toLocaleDateString() : ''} />
                  <Field label="Emergency Contact" value={profileData.emergencyContact.name && `${profileData.emergencyContact.name} — ${profileData.emergencyContact.phoneNumber}`} />
                </div>
                {user.role === 'host' && (
                  <div>
                    <span className="block text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-1.5">Vehicle details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Vehicle Number" value={profileData.vehicle.number} />
                      <Field label="Vehicle Type" value={profileData.vehicle.type} />
                      <Field label="Vehicle Model" value={profileData.vehicle.model} />
                      <Field label="Vehicle Color" value={profileData.vehicle.color} />
                    </div>
                  </div>
                )}
                <div>
                  <span className="block text-[11px] font-bold text-ink/40 uppercase tracking-wider mb-1.5">Bio</span>
                  <p className="text-ink-600 text-sm bg-paper p-4 rounded-xl border border-ink/10 leading-relaxed">
                    {profileData.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={() => setIsEditing(true)} className="bg-ink hover:bg-ink-700 text-marigold-500 font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95">
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">GR / Student ID</label>
                    <input type="text" value={profileData.studentId} onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Phone Number</label>
                    <input type="tel" value={profileData.phoneNumber} onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Gender</label>
                    <select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">College</label>
                    <input type="text" value={profileData.college} onChange={(e) => setProfileData({ ...profileData, college: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Date of Birth</label>
                    <input type="date" value={profileData.dob} onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-ink/10">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5 mt-4">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact.name}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: { ...profileData.emergencyContact, name: e.target.value } })}
                      className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5 mt-4">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={profileData.emergencyContact.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: { ...profileData.emergencyContact, phoneNumber: e.target.value } })}
                      className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {user.role === 'host' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-ink/10">
                    <div className="sm:col-span-2 mt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Vehicle details</p>
                      <p className="text-[11px] text-ink/35 mt-0.5">Used automatically whenever you publish a ride.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Vehicle Number</label>
                      <input
                        type="text"
                        value={profileData.vehicle.number}
                        onChange={(e) => setProfileData({ ...profileData, vehicle: { ...profileData.vehicle, number: e.target.value } })}
                        className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Vehicle Type</label>
                      <select
                        value={profileData.vehicle.type}
                        onChange={(e) => setProfileData({ ...profileData, vehicle: { ...profileData.vehicle, type: e.target.value } })}
                        className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Car">Car</option>
                        <option value="Auto">Auto</option>
                        <option value="Bike">Bike</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Vehicle Model</label>
                      <input
                        type="text"
                        value={profileData.vehicle.model}
                        onChange={(e) => setProfileData({ ...profileData, vehicle: { ...profileData.vehicle, model: e.target.value } })}
                        className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Vehicle Color</label>
                      <input
                        type="text"
                        value={profileData.vehicle.color}
                        onChange={(e) => setProfileData({ ...profileData, vehicle: { ...profileData.vehicle, color: e.target.value } })}
                        className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value.slice(0, 300) })}
                    rows={3}
                    maxLength={300}
                    placeholder="A short line about yourself..."
                    className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all resize-none"
                  />
                  <p className="text-[11px] text-ink/35 mt-1 text-right">{profileData.bio.length}/300</p>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-ink/10">
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-ink/5 hover:bg-ink/10 text-ink font-semibold py-2.5 px-6 rounded-xl transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="bg-marigold-500 hover:bg-marigold-400 text-ink font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
