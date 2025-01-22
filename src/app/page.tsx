'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAndRedirect() {
      if (user && !loading && !isCheckingAdmin) {
        setIsCheckingAdmin(true);
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/admin/check', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          if (response.ok && data.isAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          router.push('/dashboard');
        } finally {
          setIsCheckingAdmin(false);
        }
      }
    }

    checkAdminAndRedirect();
  }, [user, loading, router, isCheckingAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-10 loading-logo">
            <Image
              src="https://assets-v2.scaler.com/assets/programs/undergrad/webp/sst-logo-044e63073f49b767e6bca532d5fe0145b768bb12699e822d7cbce37efaa5f8f4.webp.gz"
              alt="SST Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with Logo */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="relative w-44 h-14">
            <Image
              src="https://assets-v2.scaler.com/assets/programs/undergrad/webp/sst-logo-044e63073f49b767e6bca532d5fe0145b768bb12699e822d7cbce37efaa5f8f4.webp.gz"
              alt="SST Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between p-8 max-w-md mx-auto w-full">
        {/* Image and Text */}
        <div className="flex flex-col items-center space-y-6 flex-1 justify-center w-full">
          <div className="w-full max-w-[320px] h-[320px] flex items-center justify-center relative">
            <Image
              src="/loginscreenimg.png"
              alt="Login Screen"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            Sign in with your Scaler Email!
          </h1>
        </div>

        {/* Sign In Button */}
        <div className="w-full mt-8">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
