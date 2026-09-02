import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

<<<<<<< HEAD
=======
// allowedRoles: optional array, e.g. ['host'] or ['host', 'partner']
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    toast.warning('You must be logged in to view this page.');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error("You don't have access to that page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
