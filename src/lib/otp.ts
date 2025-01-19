import { createHmac } from 'crypto';

const SECRET_KEY = process.env.OTP_SECRET_KEY || 'your-secret-key';

// Store the current OTP and its generation timestamp
let currentOTP: string | null = null;
let otpTimestamp: number = 0;

export function generateOTP(): string {
  const now = Date.now();
  const timeWindow = Math.floor(now / 30000); // 30-second window

  // If OTP exists and is still in the same time window, return it
  if (currentOTP && Math.floor(otpTimestamp / 30000) === timeWindow) {
    return currentOTP;
  }

  // Generate new HMAC-based OTP for better security
  const hmac = createHmac('sha256', SECRET_KEY);
  hmac.update(timeWindow.toString());
  const hmacResult = hmac.digest('hex');
  
  // Use the first 4 digits of the HMAC
  const otp = parseInt(hmacResult.substr(0, 8), 16) % 10000;
  const formattedOtp = otp.toString().padStart(4, '0');
  
  currentOTP = formattedOtp;
  otpTimestamp = now;

  return formattedOtp;
}

export function getTimeRemaining(): number {
  const now = Date.now();
  const secondsInWindow = Math.floor(now / 1000) % 30;
  return 30 - secondsInWindow;
}

export function getCurrentTimestamp(): number {
  return Date.now();
}
