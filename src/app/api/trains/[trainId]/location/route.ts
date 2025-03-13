import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/utils/connectDB';
import { Train } from '@/models/Rail';

export async function POST(
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
    
    if (!body.coordinates || !Array.isArray(body.coordinates) || body.coordinates.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid coordinates format. Expecting [longitude, latitude]' },
        { status: 400 }
      );
    }
    
    const updatedTrain = await Train.findByIdAndUpdate(
      trainId,
      {
        $set: {
          'currentLocation.coordinates': body.coordinates,
          'currentLocation.updatedAt': new Date(),
          currentSpeed: body.speed !== undefined ? body.speed : undefined
        }
      },
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
    console.error('Error updating train location:', error);
    return NextResponse.json(
      { error: 'Failed to update train location' },
      { status: 500 }
    );
  }
}