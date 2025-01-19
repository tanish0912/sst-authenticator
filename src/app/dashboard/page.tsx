'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOTP } from '@/hooks/useOTP';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');
  const { otp, timeRemaining } = useOTP();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        setError('Error fetching user data');
        console.error(err);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-10 loading-logo">
            <Image
              src="https://assets-v2.scaler.com/assets/programs/undergrad/webp/sst-logo-044e63073f49b767e6bca532d5fe0145b768bb12699e822d7cbce37efaa5f8f4.webp.gz"
              alt="SST Logo"
              fill
              sizes="(max-width: 768px) 128px, 128px"
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
    <main className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-md mx-auto h-[calc(100vh-3rem)]">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
          {/* Header with Logo */}
          <div className="bg-white p-4 flex justify-between items-center border-b">
            <div className="relative w-44 h-14">
              <Image
                src="https://assets-v2.scaler.com/assets/programs/undergrad/webp/sst-logo-044e63073f49b767e6bca532d5fe0145b768bb12699e822d7cbce37efaa5f8f4.webp.gz"
                alt="SST Logo"
                fill
                sizes="(max-width: 768px) 128px, 128px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>

          {/* Profile Content */}
          <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
            {error && (
              <div className="text-red-600 text-center mb-4">{error}</div>
            )}

            <div className="flex flex-col space-y-6">
              {/* Image Container */}
              <div className="mx-auto max-w-[320px] w-full">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                  <Image
                    src={userData.photoUrl || '/default-avatar.png'}
                    alt={userData.name}
                    fill
                    sizes="(max-width: 768px) 320px, 320px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Student Info and OTP Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Student Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900 truncate">{userData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Roll No</p>
                      <p className="font-medium text-gray-900 truncate">{userData.rollNumber}</p>
                    </div>
                  </div>
                </div>

                {/* OTP Section */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white flex flex-col justify-center">
                  <h3 className="text-sm font-semibold mb-2">OTP</h3>
                  <div className="text-3xl font-bold mb-2">{otp}</div>
                  <div className="text-sm text-blue-100">
                    {timeRemaining}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
