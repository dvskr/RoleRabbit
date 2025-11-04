'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
  
  // Inactivity timeout: 30 minutes (30 * 60 * 1000 ms)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  const LAST_ACTIVITY_KEY = 'lastActivityTime';

  // Update last activity time
  const updateLastActivity = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  };

  // Check if user has been inactive for 30+ minutes (only used for page close check)
  const checkInactivityOnClose = useCallback(() => {
    if (!user) return false;
    
    if (typeof window !== 'undefined') {
      const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
        return timeSinceActivity >= INACTIVITY_TIMEOUT;
      }
    }
    return false;
  }, [user]);

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
          // Set initial activity time when user is authenticated
          updateLastActivity();
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

  // Set up inactivity monitoring when user is logged in
  useEffect(() => {
    if (!user) return;

    // Update activity on user interactions
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      updateLastActivity();
    };

    // Add event listeners to track activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle page visibility change - update activity when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is visible, update activity
        updateLastActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload (close/refresh) - logout ONLY if inactive for 30+ minutes
    const handleBeforeUnload = () => {
      // Check if user has been inactive for 30+ minutes
      if (checkInactivityOnClose()) {
        // User has been inactive for 30+ minutes AND page is closing, logout
        // Use sendBeacon for reliable logout on page close
        navigator.sendBeacon('http://localhost:3001/api/auth/logout', '');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, checkInactivityOnClose]);

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
        // Set activity time on successful login
        updateLastActivity();
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
        // Set activity time on successful signup
        updateLastActivity();
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

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear activity tracking
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    }
    setUser(null);
  }, []);

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
