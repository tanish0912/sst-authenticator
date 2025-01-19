import { NextResponse } from 'next/server';
import { generateOTP, getTimeRemaining } from '@/lib/otp';
import { authenticateUser } from '@/middleware/auth';

export async function GET(request: Request) {
  // Authenticate user using middleware
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Generate OTP
    const otp = generateOTP();
    const timeRemaining = getTimeRemaining();

    return NextResponse.json({
      otp,
      timeRemaining,
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
