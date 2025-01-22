'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useOTP() {
  const [otp, setOtp] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { user } = useAuth();

  // Function to calculate initial time remaining
  const getInitialTimeRemaining = useCallback(() => {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
  }, []);

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
        const data = await response.json();
        console.error('OTP fetch failed:', data.error);
        return;
      }

      const data = await response.json();
      setOtp(data.otp);
      setTimeRemaining(data.timeRemaining);
    } catch (error) {
      console.error('Error fetching OTP:', error);
    }
  }, [user]);

  // Initialize OTP and timer
  useEffect(() => {
    if (user) {
      // Set initial time remaining
      setTimeRemaining(getInitialTimeRemaining());
      
      // Fetch initial OTP
      fetchOTP();

      // Calculate delay to next 30-second boundary
      const msToNextWindow = (30 - (Math.floor(Date.now() / 1000) % 30)) * 1000;
      
      // Set timeout to align with next 30-second window
      const alignmentTimeout = setTimeout(() => {
        fetchOTP();
        // After alignment, set up regular interval
        const interval = setInterval(fetchOTP, 30000);
        return () => clearInterval(interval);
      }, msToNextWindow);

      return () => clearTimeout(alignmentTimeout);
    } else {
      setOtp('');
      setTimeRemaining(0);
    }
  }, [fetchOTP, getInitialTimeRemaining, user]);

  // Update time remaining every second
  useEffect(() => {
    if (user) {
      const timer = setInterval(() => {
        const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user]);

  return { otp, timeRemaining };
}
