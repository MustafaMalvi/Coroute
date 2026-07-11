import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import AuthBackground from '../components/AuthBackground';

const getSignupErrorMessage = (error) => {
  if (!error.response) {
    return 'Cannot reach the backend. Please make sure the server is running and VITE_BACKEND_URL is correct.';
  }

  const data = error.response.data;

  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.msg) return data.msg;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg || item.message || item.error).filter(Boolean).join(' ');
  }

  return `Signup failed with status ${error.response.status}. Please try again.`;
};

const ROLES = [
  {
    value: 'host',
    title: 'Ride Host',
    desc: 'Publish rides, manage bookings',
    icon: 'M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z',
  },
  {
    value: 'partner',
    title: 'Ride Partner',
    desc: 'Search and book open seats',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('partner');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.message) {
      toast.info(location.state.message);
    }
  }, [location]);

  const handleSignup = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedStudentId = studentId.trim();

    if (trimmedName && trimmedEmail && password && gender) {
      if (!trimmedEmail.endsWith('@marwadiuniversity.ac.in')) {
        toast.error('Please use your @marwadiuniversity.ac.in student email.');
        return;
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }

      if (role === 'host') {
        if (!phoneNumber.trim()) {
          toast.error('Mobile number is required for Ride Hosts.');
          return;
        }
        if (!vehicleNumber.trim()) {
          toast.error('Vehicle number is required for Ride Hosts.');
          return;
        }
      }

      try {
        setLoading(true);
        await api.post('/api/auth/register', {
          name: trimmedName,
          email: trimmedEmail,
          password,
          studentId: trimmedStudentId,
          gender,
          role,
          phoneNumber: phoneNumber.trim(),
          vehicle: role === 'host' ? {
            number: vehicleNumber.trim(),
            type: vehicleType.trim(),
            model: vehicleModel.trim(),
            color: vehicleColor.trim(),
          } : undefined,
        });
        toast.success('Account created successfully! You can now log in.');
        navigate('/login');
      } catch (error) {
        toast.error(getSignupErrorMessage(error));
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning('Please fill in all required fields.');
    }
  };

  return (
    <AuthBackground>
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
          <div className="mb-7">
            <span className="font-meter text-xs tracking-widest text-marigold-400 uppercase">New rider</span>
            <h2 className="font-display text-3xl mt-2 text-paper">Create account</h2>
            <p className="text-paper/60 mt-2 text-sm">Join the commuters saving on their daily ride.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-2">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                      role === r.value
                        ? 'border-marigold-500 bg-marigold-500/10'
                        : 'border-white/15 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <svg className={`w-5 h-5 mb-2 ${role === r.value ? 'text-marigold-400' : 'text-paper/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={r.icon} />
                    </svg>
                    <p className={`text-sm font-bold ${role === r.value ? 'text-paper' : 'text-paper/70'}`}>{r.title}</p>
                    <p className="text-[11px] text-paper/40 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="e.g., Rahul Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="student@marwadiuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">
                  GR / ID <span className="text-paper/30 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="MU12345"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all [&>option]:text-ink"
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">
                Mobile number {role === 'host' ? '' : <span className="text-paper/30 font-normal normal-case">(optional)</span>}
              </label>
              <input
                type="tel"
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                required={role === 'host'}
              />
              {role === 'host' && (
                <p className="text-[11px] text-paper/40 mt-1">Ride Partners can call you directly from the chat window using this number.</p>
              )}
            </div>

            {role === 'host' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 animate-fade-in">
                <p className="text-xs font-bold uppercase tracking-wide text-marigold-400">Vehicle details</p>
                <p className="text-[11px] text-paper/40 -mt-2">Saved to your Host profile — no need to re-enter this when you publish a ride.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-paper/60 mb-1.5">Vehicle number</label>
                    <input
                      type="text"
                      placeholder="e.g., GJ-03-XX-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-paper/60 mb-1.5">Vehicle type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all [&>option]:text-ink"
                    >
                      <option value="">Select</option>
                      <option value="Car">Car</option>
                      <option value="Auto">Auto</option>
                      <option value="Bike">Bike</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-paper/60 mb-1.5">Vehicle model</label>
                    <input
                      type="text"
                      placeholder="e.g., Swift Dzire"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-paper/60 mb-1.5">Vehicle color</label>
                    <input
                      type="text"
                      placeholder="e.g., White"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 mt-6 bg-marigold-500 hover:bg-marigold-400 text-ink rounded-xl font-bold text-base active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-marigold-500/20"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/10 text-center text-sm text-paper/60">
            Already have an account?{' '}
            <Link to="/login" className="text-marigold-400 hover:text-marigold-300 font-bold transition-colors">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};

export default Signup;
