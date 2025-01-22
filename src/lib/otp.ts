import { createHmac } from 'crypto';

const SECRET_KEY = process.env.OTP_SECRET_KEY || 'your-secret-key';

export function generateOTP(): string {
  const timeWindow = Math.floor(Date.now() / 30000); // 30-second window

  // Generate HMAC-based OTP using only the time window
  const hmac = createHmac('sha256', SECRET_KEY);
  hmac.update(timeWindow.toString());
  const hmacResult = hmac.digest('hex');
  
  // Use the first 4 digits of the HMAC
  const otp = parseInt(hmacResult.substr(0, 8), 16) % 10000;
  return otp.toString().padStart(4, '0');
}

export function getTimeRemaining(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

export function getTimeWindow(): number {
  return Math.floor(Date.now() / 30000);
}
