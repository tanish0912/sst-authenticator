'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOTP } from '@/hooks/useOTP';

interface StudentData {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string;
  email: string;
}

function ProfileModal({ student, onClose }: { student: StudentData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Back"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-600">
          <div className="max-w-[280px] mx-auto pt-8">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border-2 border-white shadow-md">
              <Image
                src={student.photoUrl || '/default-avatar.png'}
                alt={student.name}
                fill
                sizes="(max-width: 768px) 280px, 280px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white text-center">{student.name}</h2>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-3">
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
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900 truncate">{student.name}</p>
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
                <p className="text-sm text-gray-500">Roll Number</p>
                <p className="font-medium text-gray-900 truncate">{student.rollNumber}</p>
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 truncate">{student.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { otp, timeRemaining } = useOTP();
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const fetchAllStudents = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setAllStudents(data.users);
      setError('');
    } catch (err) {
      setError('Error fetching students data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllStudents();
    }
  }, [user, fetchAllStudents]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return allStudents;
    
    const query = searchQuery.toUpperCase();
    return allStudents.filter(student => 
      student.rollNumber.includes(query)
    );
  }, [searchQuery, allStudents]);

  if (loading || isLoading || !allStudents.length) {
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
    <main className="min-h-screen bg-gray-100 py-4 sm:py-12 px-2 sm:px-4">
      {selectedStudent && (
        <ProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 sm:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* OTP Display */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg w-full sm:w-auto">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Current OTP</h3>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{otp}</div>
                  <div className="text-sm text-blue-500">
                    Expires in: {timeRemaining}s
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 w-full sm:w-auto text-center sm:text-left px-4 py-2 border border-red-200 rounded-lg sm:border-none"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Roll Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 text-black"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-center mb-4">{error}</div>
            )}

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={student.photoUrl || '/default-avatar.png'}
                        alt={student.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No students found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
