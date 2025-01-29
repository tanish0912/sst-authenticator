import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isAdmin, authenticateUser } from "@/middleware/auth";

interface CounterData {
  counter: number;
  lastResetMonth: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
): Promise<NextResponse> {
  try {
    const { studentId } = await params;
    
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
    const counterDoc = await db.collection('studentCounters').doc(studentId).get();
    const currentMonth = new Date().getMonth();

    if (!counterDoc.exists) {
      return NextResponse.json({ counter: 0 });
    }

    const data = counterDoc.data() as CounterData;
    
    if (data.lastResetMonth !== currentMonth) {
      await db.collection('studentCounters').doc(studentId).set({
        counter: 0,
        lastResetMonth: currentMonth
      });
      return NextResponse.json({ counter: 0 });
    }

    return NextResponse.json({ counter: data.counter });
  } catch (error) {
    console.error('Error in GET counter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
): Promise<NextResponse> {
  try {
    const { studentId } = await params;
    
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

    await db.collection('studentCounters').doc(studentId).set({
      counter,
      lastResetMonth: currentMonth
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST counter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}