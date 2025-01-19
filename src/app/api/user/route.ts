import { NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { db } from '@/lib/firebase-admin';

// Helper function to extract Google Drive file ID from URL
function extractFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

export async function GET(request: Request) {
  // Authenticate user
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const email = auth.email!;
    console.log("Email:", email);
    
    const rollNo = email.split('@')[0].split('.')[1].toUpperCase();
    const studentRef = db.collection('students').doc(rollNo);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { name, photo } = studentDoc.data() as { name: string; photo: string };
    const fileId = extractFileId(photo);
    const thumbnailPhoto = fileId
      ? `https://drive.google.com/thumbnail?id=${fileId}`
      : photo;

    return NextResponse.json({ 
      user: {
        name,
        rollNumber: rollNo,
        photoUrl: thumbnailPhoto,
        email: email
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
