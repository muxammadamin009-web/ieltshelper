import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // При первой загрузке проверяем токен
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        // Поддержка обеих структур ответа (res.data.user или res.data)
        setUser(res.data.user || res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    const token = res.data.token;
    const userData = res.data.user || res.data;

    if (token) {
      localStorage.setItem('token', token);
    }
    
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password) => {
    // ВАЖНО: заменено с /auth/signup на /auth/register
    const res = await api.post('/auth/register', { name, email, password });
    
    const token = res.data.token;
    const userData = res.data.user || res.data;

    if (token) {
      localStorage.setItem('token', token);
    }

    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);