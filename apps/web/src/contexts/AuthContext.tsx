'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/verify', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        // Silent fail - user likely not logged in
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Call Node.js API for authentication
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for httpOnly token
        body: JSON.stringify({ email, password }),
      });
      
      // Read response text once (can only be read once)
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          // Try to parse as JSON
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText || 'Unknown error'}`;
          }
        } catch (parseError) {
          // If not JSON, use response text or status
          errorMessage = responseText || `Server error: ${response.status} ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          throw new Error('Empty response from server');
        }
      } catch (parseError: any) {
        console.error('Failed to parse login response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid response from server. Please check if the API server is running.');
      }
      
      // Token is now stored in httpOnly cookie (not in localStorage)
      // Only store user data in memory
      if (data.user) {
        setUser(data.user);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide more helpful error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the API server is running on http://localhost:3001');
      }
      if (error.message.includes('Unexpected end of JSON')) {
        throw new Error('Server returned invalid response. Please check if the API server is running.');
      }
      throw error; // Re-throw to let UI handle it
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Call Node.js API for registration
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for httpOnly token
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Token is now stored in httpOnly cookie (not in localStorage)
      // Only store user data in memory
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Provide more helpful error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error; // Re-throw to let UI handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
