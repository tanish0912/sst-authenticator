import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    'Missing Firebase Admin credentials. Please check your environment variables.'
  );
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Handle both formats of private key
        privateKey: privateKey.includes('\\n') 
          ? privateKey.replace(/\\n/g, '\n')
          : privateKey,
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const db = getFirestore();
export const auth = getAuth();
