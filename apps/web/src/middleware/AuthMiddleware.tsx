'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiService from '@/services/apiService';

interface AuthMiddlewareProps {
  children: ReactNode;
}

export default function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/landing'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // httpOnly cookies are handled automatically by browser
      // No need to check localStorage anymore

      // For public routes, no auth check needed
      if (isPublicRoute) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify auth via API (httpOnly cookie sent automatically)
      try {
        await apiService.getUserProfile();
        setIsAuthenticated(true);
      } catch (error) {
        // Auth failed - user not authenticated or token invalid
        // httpOnly cookie will handle cleanup automatically
        setIsAuthenticated(false);
        // Redirect to login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isPublicRoute, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If accessing a public route, show it
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, redirect to login (handled by router.push in useEffect)
  return null;
}

