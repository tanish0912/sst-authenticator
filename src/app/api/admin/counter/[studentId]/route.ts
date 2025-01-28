import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isAdmin, authenticateUser } from "@/middleware/auth";

interface CounterData {
  counter: number;
  lastResetMonth: number;
}

type Props = {
  params: {
    studentId: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    if (!authResult.email) {
      return NextResponse.json({ error: 'Email not found in authentication result' }, { status: 400 });
    }
    const isUserAdmin = await isAdmin(authResult.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const studentId = params.studentId;
    const counterDoc = await db.collection('studentCounters').doc(studentId).get();
    
    const currentMonth = new Date().getMonth();
    
    if (!counterDoc.exists) {
      return NextResponse.json({ counter: 0, lastResetMonth: currentMonth });
    }

    const data = counterDoc.data() as CounterData;
    
    // Reset counter if it's a new month
    if (data.lastResetMonth !== currentMonth) {
      await db.collection('studentCounters').doc(studentId).set({
        counter: 0,
        lastResetMonth: currentMonth
      });
      return NextResponse.json({ counter: 0, lastResetMonth: currentMonth });
    }

    return NextResponse.json({ counter: data.counter, lastResetMonth: data.lastResetMonth });
  } catch (error) {
    console.error('Error in GET /api/admin/counter/[studentId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    if (!authResult.email) {
      return NextResponse.json({ error: 'Email not found in authentication result' }, { status: 400 });
    }
    const isUserAdmin = await isAdmin(authResult.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const studentId = params.studentId;
    const { counter } = await request.json();
    const currentMonth = new Date().getMonth();

    await db.collection('studentCounters').doc(studentId).set({
      counter,
      lastResetMonth: currentMonth
    });

    return NextResponse.json({ counter, lastResetMonth: currentMonth });
  } catch (error) {
    console.error('Error in POST /api/admin/counter/[studentId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
