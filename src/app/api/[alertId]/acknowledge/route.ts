
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
    
    if (!body.userId || !body.userName) {
      return NextResponse.json(
        { error: 'User ID and name are required for acknowledgment' },
        { status: 400 }
      );
    }
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          status: 'acknowledged',
          acknowledgedBy: {
            userId: body.userId,
            userName: body.userName,
            timestamp: new Date()
          }
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
      { error: 'Failed to acknowledge alert', details: error.message },
      { status: 400 }
    );
  }
}