import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useOTP() {
  const [otp, setOtp] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const { user } = useAuth();

  const fetchOTP = useCallback(async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/otp', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OTP');
      }

      const data = await response.json();
      setOtp(data.otp);
      setTimeRemaining(data.timeRemaining);
    } catch (error) {
      console.error('Error fetching OTP:', error);
    }
  }, [user]);

  useEffect(() => {
    // Fetch initial OTP
    fetchOTP();

    // Set up countdown interval
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // When time is about to expire, fetch new OTP
          fetchOTP();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    // Set up a backup interval to ensure OTP stays in sync
    const syncInterval = setInterval(fetchOTP, 15000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(syncInterval);
    };
  }, [fetchOTP]);

  return { otp, timeRemaining };
}
