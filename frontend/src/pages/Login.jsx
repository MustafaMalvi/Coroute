import { useContext ,useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';
import { Eye, EyeOff } from 'lucide-react';
import { comman, signup } from '../styles/style';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setemail] = useState('');
  const [pwd, setpwd] = useState('');
  const [showpwd, setshowpwd] = useState(false);
  const { login } = useContext(AuthContext);
  const [loading, setloading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email.trim() !== "" && pwd.trim() !== "") {
      try {
        setloading(true);
        const response = await api.post('/api/auth/login', { email, pwd });
        const { token, user } = response.data;
        login(token, user.name, user.gender, user.id, user.role);
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
        const redirectTo = location.state?.from || '/';
        navigate(redirectTo, { replace: true });
      }
      catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Looks like you don't have an account yet. Please sign up first!");
          navigate('/signup');
        }
        else 
          toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        
      } 
      finally {
        setloading(false);
      }
    }
    else {
      toast.warning("Please enter both your Email and Password.");
    }
  };

  return (
    <AuthBackground>
      <div className="max-w-md w-full animate-fade-in">
        <div className={signup.card} >
          <div className="mb-8">
            <span className={comman.yellowtxt} >Boarding pass</span>
            <h2 className={comman.pageheading} >Welcome back</h2>
            <p className={comman.pagesubh} >Sign in with your student account to continue.</p>
          </div>

          {location.state?.message && (
            <div className='bg-marigold-500/10 border-l-4 border-marigold-500 p-4 mb-6 rounded-r-lg'>
              <p className='text-sm font-medium text-marigold-300'>{location.state.message}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={signup.label} >Email address</label>
              <input
                type="email"
                placeholder="student@marwadiuniversity.ac.in"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className={signup.input}
                required
              />
            </div>

            <div className='relative'>
              <label className={signup.label} >Password</label>
              <input
                type= { showpwd ? 'text' : 'password' }
                className={signup.input}
                placeholder='********'
                value={pwd}
                onChange={(e) => setpwd(e.target.value)}
                required
              />
              <button type='button' 
                onClick={() => setshowpwd(!showpwd)} 
                className={signup.eyebutton} >
                  {showpwd ? (<EyeOff className='w-5 h-5 text-paper/60' />) : (<Eye className='w-5 h-5 text-paper/60'/>)}
              </button>
            </div>

            <button type="submit"
              disabled={loading}
              className={signup.submit} >
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