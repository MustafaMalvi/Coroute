import { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const readStoredUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    name: localStorage.getItem('name') || '',
    gender: localStorage.getItem('gender') || '',
    id: localStorage.getItem('id') || '',
    role: localStorage.getItem('role') || 'partner',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    // Keep state in sync if token is cleared/set from another tab
    const onStorage = () => setUser(readStoredUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (token, name, gender, id, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name || '');
    localStorage.setItem('gender', gender || '');
    localStorage.setItem('id', id || '');
    localStorage.setItem('role', role || 'partner');
    setUser({ token, name, gender, id, role: role || 'partner' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('gender');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
