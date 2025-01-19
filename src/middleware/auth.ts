import { auth } from '@/lib/firebase-admin';

export async function authenticateUser(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function isAdmin(email: string) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}
