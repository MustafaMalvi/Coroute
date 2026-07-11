import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email.trim() !== '' && password.trim() !== '') {
      try {
        setLoading(true);
        const response = await api.post('/api/auth/login', { email, password });
        const { token, user } = response.data;
        login(token, user.name, user.gender, user.id, user.role);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        const redirectTo = location.state?.from || '/';
        navigate(redirectTo, { replace: true });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Looks like you don't have an account yet. Please sign up first!");
          navigate('/signup');
        } else {
          toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning('Please enter both your Email and Password.');
    }
  };

  return (
    <AuthBackground>
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
          <div className="mb-8">
            <span className="font-meter text-xs tracking-widest text-marigold-400 uppercase">Boarding pass</span>
            <h2 className="font-display text-3xl mt-2 text-paper">Welcome back</h2>
            <p className="text-paper/60 mt-2 text-sm">Sign in with your student account to continue.</p>
          </div>

          {location.state?.message && (
            <div className="bg-marigold-500/10 border-l-4 border-marigold-500 p-4 mb-6 rounded-r-lg">
              <p className="text-sm font-medium text-marigold-300">{location.state.message}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-paper/60 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="student@marwadiuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-paper focus:ring-2 focus:ring-marigold-500 focus:border-marigold-500 outline-none transition-all placeholder-paper/30"
                required
              />
            </div>

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
              className="w-full flex justify-center items-center py-3.5 px-4 bg-marigold-500 hover:bg-marigold-400 text-ink rounded-xl font-bold text-base active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-marigold-500/20"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-paper/60">
            Not registered yet?{' '}
            <Link to="/signup" className="text-marigold-400 hover:text-marigold-300 font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};

export default Login;
