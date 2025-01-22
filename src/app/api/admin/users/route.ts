import { NextResponse } from 'next/server';
import { authenticateUser, isAdmin } from '@/middleware/auth';
import { db } from '@/lib/firebase-admin';
import { CollectionReference, Query } from 'firebase-admin/firestore';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search')?.toUpperCase() || '';

    if (email) {
      // Search for specific student
      const rollNo = email.split('@')[0].split('.')[1].toUpperCase();
      const studentRef = db.collection('students').doc(rollNo);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const { name, photoUrl } = studentDoc.data() as { name: string; photoUrl: string };
      const fileId = extractFileId(photoUrl);
      const thumbnailPhoto = fileId
        ? `https://drive.google.com/thumbnail?id=${fileId}`
        : photoUrl;

      return NextResponse.json({
        user: {
          id: studentDoc.id,
          name,
          rollNumber: rollNo,
          photoUrl: thumbnailPhoto,
          email
        }
      });
    }

    // Get all students with pagination
    let query: CollectionReference | Query = db.collection('students');
    let totalDocs = 0;
    
    // Add search filter if provided
    if (search) {
      // Get all documents and filter in memory for partial matches
      // This is more efficient than running multiple queries
      const allDocs = await query.orderBy('__name__').get();
      const matchingDocs = allDocs.docs.filter(doc => 
        doc.id.includes(search)
      );
      
      totalDocs = matchingDocs.length;
      
      // Calculate pagination slice
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedDocs = matchingDocs.slice(startIndex, endIndex);
      
      const students = paginatedDocs.map(doc => {
        const data = doc.data();
        const fileId = extractFileId(data.photoUrl);
        const thumbnailPhoto = fileId
          ? `https://drive.google.com/thumbnail?id=${fileId}`
          : data.photoUrl;

        return {
          id: doc.id,
          name: data.name,
          rollNumber: doc.id,
          photoUrl: thumbnailPhoto
        };
      });

      return NextResponse.json({
        users: students,
        pagination: {
          total: totalDocs,
          page,
          limit,
          totalPages: Math.ceil(totalDocs / limit)
        }
      });
    }

    // If no search query, get total count and apply regular pagination
    totalDocs = (await query.count().get()).data().count;
    
    // Apply pagination
    const startAfter = (page - 1) * limit;
    const snapshot = await query
      .orderBy('__name__')
      .offset(startAfter)
      .limit(limit)
      .get();

    const students = snapshot.docs.map(doc => {
      const data = doc.data();
      const fileId = extractFileId(data.photoUrl);
      const thumbnailPhoto = fileId
        ? `https://drive.google.com/thumbnail?id=${fileId}`
        : data.photoUrl;

      return {
        id: doc.id,
        name: data.name,
        rollNumber: doc.id,
        photoUrl: thumbnailPhoto
      };
    });

    return NextResponse.json({
      users: students,
      pagination: {
        total: totalDocs,
        page,
        limit,
        totalPages: Math.ceil(totalDocs / limit)
      }
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
