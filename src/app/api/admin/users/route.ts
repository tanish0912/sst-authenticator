import { NextResponse } from 'next/server';
import { authenticateUser, isAdmin } from '@/middleware/auth';
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

  // Check if user is admin
  if (!await isAdmin(auth.email!)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Search for specific student
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
          id: studentDoc.id,
          name,
          rollNumber: rollNo,
          photoUrl: thumbnailPhoto,
          email
        }
      });
    } else {
      // Get all students
      const studentsSnapshot = await db.collection('students').get();
      const students = studentsSnapshot.docs.map(doc => {
        const data = doc.data();
        const fileId = extractFileId(data.photo);
        const thumbnailPhoto = fileId
          ? `https://drive.google.com/thumbnail?id=${fileId}`
          : data.photo;

        return {
          id: doc.id,
          name: data.name,
          rollNumber: doc.id,
          photoUrl: thumbnailPhoto,
          email: `${data.name.toLowerCase().replace(/\s+/g, '')}.${doc.id.toLowerCase()}@sst.scaler.com`
        };
      });

      return NextResponse.json({ users: students });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
