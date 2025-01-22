'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOTP } from '@/hooks/useOTP';
import { debounce } from 'lodash';

interface StudentData {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function ProfileModal({ student, onClose }: { student: StudentData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden">
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
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/default-avatar.png';
                }}
              />
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white text-center">{student.name}</h2>
          </div>
        </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm p-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { otp, timeRemaining } = useOTP();
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const fetchStudents = useCallback(async (page: number, search: string = '') => {
    if (!user) return;

    try {
      if (search) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${pagination.limit}&search=${search}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.users);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError('Error fetching students data');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [user, pagination.limit]);

  // Debounced search function with 300ms delay
  const debouncedSearch = useMemo(
    () => debounce((search: string) => {
      if (search) {
        // Reset to first page when searching
        fetchStudents(1, search);
      } else {
        // If search is cleared, reset to first page without search
        fetchStudents(1);
      }
    }, 300),
    [fetchStudents]
  );

  useEffect(() => {
    if (user) {
      debouncedSearch(searchQuery.toUpperCase());
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [user, searchQuery, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage, searchQuery);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage student profiles and authentication</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-md px-6 py-3 border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Current OTP</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-mono font-bold text-blue-600">{otp}</span>
                <span className="text-sm font-medium text-gray-600">({timeRemaining}s)</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by roll number..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-black"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={student.photoUrl || '/default-avatar.png'}
                          alt={student.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-sm text-gray-500 truncate">{student.rollNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3 mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:bg-gray-100 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:bg-gray-100 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedStudent && (
        <ProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
