import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('taskflow_token');
    const savedUser = localStorage.getItem('taskflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token in background
        api.get('/auth/me')
          .then((res) => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('taskflow_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // Token might be expired
            logout();
          })
          .finally(() => setIsLoading(false));
      } catch (e) {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData, portalPath } = res.data;

      localStorage.setItem('taskflow_token', accessToken);
      localStorage.setItem('taskflow_refresh_token', refreshToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      return { success: true, user: userData, portalPath };
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore logout API error
    } finally {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_refresh_token');
      localStorage.removeItem('taskflow_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const getPortalPath = (roleCode) => {
    switch (roleCode) {
      case 'ADMIN': return '/admin/dashboard';
      case 'PROJECT_MANAGER': return '/manager/dashboard';
      case 'TEAM_MEMBER': return '/member/dashboard';
      case 'CLIENT': return '/client/dashboard';
      default: return '/';
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'PROJECT_MANAGER',
    isMember: user?.role === 'TEAM_MEMBER',
    isClient: user?.role === 'CLIENT',
    portalPath: user ? getPortalPath(user.role) : '/',
    login,
    logout,
    getPortalPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
