import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isAdmin, authenticateUser } from "@/middleware/auth";

interface CounterData {
  counter: number;
  lastResetMonth: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // Authentication and authorization logic
    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    if (!authResult.email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }
    
    if (!await isAdmin(authResult.email)) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }

    // Counter logic
    const counterDoc = await db.collection('studentCounters').doc(params.studentId).get();
    const currentMonth = new Date().getMonth();

    if (!counterDoc.exists) {
      return NextResponse.json({ counter: 0, lastResetMonth: currentMonth });
    }

    const data = counterDoc.data() as CounterData;
    
    if (data.lastResetMonth !== currentMonth) {
      await db.collection('studentCounters').doc(params.studentId).set({
        counter: 0,
        lastResetMonth: currentMonth
      });
      return NextResponse.json({ counter: 0, lastResetMonth: currentMonth });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // Authentication and authorization logic
    const authResult = await authenticateUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    if (!authResult.email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }
    
    if (!await isAdmin(authResult.email)) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }

    // Update counter logic
    const { counter } = await request.json();
    const currentMonth = new Date().getMonth();

    await db.collection('studentCounters').doc(params.studentId).set({
      counter,
      lastResetMonth: currentMonth
    });

    return NextResponse.json({ counter, lastResetMonth: currentMonth });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}