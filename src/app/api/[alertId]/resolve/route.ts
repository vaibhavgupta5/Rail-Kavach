import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/utils/connectDB';
import { Alert } from '@/models/Rail';

export async function PUT(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    await connectDB();
    
    const { alertId } = params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID format' }, { status: 400 });
    }
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          status: 'resolved',
          resolvedAt: new Date(),
          notes: body.notes
        }
      },
      { new: true }
    ).lean();
    
    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to resolve alert', details: error.message },
      { status: 400 }
    );
  }
}
