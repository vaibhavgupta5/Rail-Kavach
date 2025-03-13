import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/utils/connectDB';
import { Train } from '@/models/Rail';

export async function GET(
  request: NextRequest,
  { params }: { params: { trainId: string } }
) {
  try {
    await connectDB();
    
    const { trainId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return NextResponse.json(
        { error: 'Invalid train ID format' },
        { status: 400 }
      );
    }
    
    const train = await Train.findById(trainId).lean();
    
    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(train);
  } catch (error) {
    console.error('Error fetching train details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch train details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { trainId: string } }
) {
  try {
    await connectDB();
    
    const { trainId } = params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return NextResponse.json(
        { error: 'Invalid train ID format' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    
    // Only update fields that are provided
    if (body.trainNumber) updateData.trainNumber = body.trainNumber;
    if (body.trainName) updateData.trainName = body.trainName;
    if (body.currentSpeed !== undefined) updateData.currentSpeed = body.currentSpeed;
    if (body.status) updateData.status = body.status;
    if (body.driver) updateData.driver = body.driver;
    
    const updatedTrain = await Train.findByIdAndUpdate(
      trainId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedTrain) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTrain);
  } catch (error) {
    console.error('Error updating train:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update train' },
      { status: 500 }
    );
  }
}
