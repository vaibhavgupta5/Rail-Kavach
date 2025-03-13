import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/utils/connectDB';
import { Station } from '@/models/Rail';

export async function GET(
  request: NextRequest,
  { params }: { params: { stationId: string } }
) {
  try {
    await connectDB();
    
    const { stationId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return NextResponse.json(
        { error: 'Invalid station ID format' },
        { status: 400 }
      );
    }
    
    const station = await Station.findById(stationId).lean();
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(station);
  } catch (error) {
    console.error('Error fetching station details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station details' },
      { status: 500 }
    );
  }
}
