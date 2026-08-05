import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import AuthBackground from '../components/AuthBackground';
import { Eye, EyeOff, Car, Users } from "lucide-react";
import { signup, comman } from '../styles/style.js';

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
  { value: 'host',
    title: 'Ride Host',
    desc: 'Publish rides, manage bookings',
    icon: Car,
  },
  { value: 'partner',
    title: 'Ride Partner',
    desc: 'Search and book open seats',
    icon: Users,
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [conpassword, setConPassword] = useState('');
  const [showConPassword, setShowConPassword] = useState(false);
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
      
      if (password !== conpassword){
        toast.error('Please Enter Same Password in Confirm Password Fild')
        return;
      }
      if (role === 'host') {
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

  const handleVehicleInputChange = (e) => {
    const rawValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let validValue = '';

    for (let i = 0; i < rawValue.length; i++) {
      const char = rawValue[i];

      if (i < 2) {
        if (/[A-Z]/.test(char)) 
          validValue += char;
      } else if (i < 4) {
        if (/[0-9]/.test(char)) 
          validValue += char;
      } else if (i < 6) {
        if (/[A-Z]/.test(char)) 
          validValue += char;
      } else if (i < 10) {
        if (/[0-9]/.test(char)) 
          validValue += char;
      }
    }

  // 3. Auto-insert hyphens for display
    let formattedValue = validValue;
    if (validValue.length > 2) formattedValue = `${validValue.slice(0, 2)}-${validValue.slice(2)}`;
    if (validValue.length > 4) formattedValue = `${formattedValue.slice(0, 5)}-${validValue.slice(4)}`;
    if (validValue.length > 6) formattedValue = `${formattedValue.slice(0, 8)}-${validValue.slice(6)}`;

  // 4. Update state
    setVehicleNumber(formattedValue);
  };

  return (
    <AuthBackground>
      <div className="max-w-md w-full animate-fade-in">
        <div className={signup.card}>
          <div className="mb-7">
            <span className={comman.yellowtxt} >New rider</span>
            <h2 className={comman.pageheading} >Create account</h2>
            <p className={comman.pagesubh} >Join the commuters saving on their daily ride.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className={signup.label}>I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`${signup.rolebutton} ${ role === r.value ? signup.rolehost : signup.rolepartner }`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${
                      role === r.value ? "text-marigold-400" : "text-paper/40"
                      }`}
                    />
                    <p className={`text-sm font-bold ${role === r.value ? 'text-paper' : 'text-paper/70'}`}>{r.title}</p>
                    <p className="text-[11px] text-paper/40 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={signup.label}>Full name</label>
              <input
                type="text"
                placeholder="e.g., Rahul Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={signup.input}
                required
              />
            </div>

            <div>
              <label className={signup.label}>Email</label>
              <input
                type="email"
                placeholder="student@marwadiuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={signup.input}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={signup.label}>
                  GR / ID <span className="text-paper/30 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={signup.input}
                />
              </div>
              <div>
                <label className={signup.label}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={signup.input}
                  required
                >
                  <option value="" hidden>Select</option>
                  <option style={{backgroundColor:"#4e4949d9"}} value="Male">Male</option>
                  <option style={{backgroundColor:"#4e4949d9"}} value="Female">Female</option>
                  <option style={{backgroundColor:"#4e4949d9"}} value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">
                Mobile number {role === 'host' ? '' : <span className="text-paper/30 font-normal normal-case">(optional)</span>}
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={signup.input}
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
                    <label className={signup.label}>Vehicle number</label>
                    <input
                      type="text"
                      placeholder="e.g., GJ-03-XX-1234"
                      value={vehicleNumber}
                      onChange={handleVehicleInputChange}
                      maxLength={13}
                      pattern="^[A-Z]{2}-[0-9]{2}-[A-Z]{2}-[0-9]{4}$"
                      title="Please enter a valid 10-character vehicle number"
                      className={signup.input}
                      required
                    />
                  </div>
      
                  <div>
                    <label className={signup.label}>Vehicle type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className={signup.input} >
                      <option value="" hidden>Select</option>
                      <option style={{backgroundColor:"#4e4949d9"}} value="Car" >Car</option>
                      <option style={{backgroundColor:"#4e4949d9"}} value="Auto">Auto</option>
                      <option style={{backgroundColor:"#4e4949d9"}} value="Bike">Bike</option>
                    </select>
                  </div>
      
                  <div>
                    <label className={signup.label}>Vehicle model</label>
                    <input
                      type="text"
                      placeholder="e.g., Swift Dzire"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className={signup.input}
                    />
                  </div>
      
                  <div className="col-span-2">
                    <label className={signup.label}>Vehicle color</label>
                    <input
                      type="text"
                      placeholder="e.g., White"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className={signup.input}/>
                  </div>
                </div>
              </div>
            )}

            <div className='relative'>
              <label className={signup.label} >Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={signup.input}
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className={signup.eyebutton}
              >
                {showPassword ? (<EyeOff className='w-5 h-5 text-paper/60' />) : (<Eye className='w-5 h-5 text-paper/60'/>)}
              </button>
            </div>

            <div className='relative'>
              <label className={signup.label} >Confirm Password</label>
              <input
                type={showConPassword ? "text" : "password"}
                placeholder="********"
                value={conpassword}
                onChange={(e) => setConPassword(e.target.value)}
                className={signup.input}
                required
              />
              <button
                type='button'
                onClick={() => setShowConPassword(!showConPassword)}
                className={signup.eyebutton}
              >
                {showConPassword ? (<EyeOff className='w-5 h-5 text-paper/60' />) : (<Eye className='w-5 h-5 text-paper/60'/>)}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={signup.submit}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-paper/60" >
            Already have an account?{'  '}
            <Link to="/login" className="text-marigold-400 hover:text-marigold-300 font-bold transition-colors pl-1">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};

export default Signup;
