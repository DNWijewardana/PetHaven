import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

interface User {
  name: string;
  email: string;
  picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        // If no stored user, check with backend
        const response = await axios.get(`${API_ENDPOINTS.AUTH}/status`, {
          withCredentials: true
        });

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_ENDPOINTS.AUTH}/logout`, {}, {
        withCredentials: true
      });
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still remove local data even if server request fails
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
} 