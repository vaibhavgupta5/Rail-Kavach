import { Camera } from '@/models/Rail';
import { connectDB } from '@/utils/connectDB';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const railwaySection = searchParams.get('railwaySection');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (railwaySection) filter.railwaySection = railwaySection;
    if (status) filter.status = status;
    
    const cameras = await Camera.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('nearestStation', 'stationName stationCode')
      .lean();
    
    const total = await Camera.countDocuments(filter);
    
    return NextResponse.json({
      data: cameras,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch cameras', details: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
    try {
      await connectDB();
      
      const body = await request.json();
      
      const camera = new Camera(body);
      await camera.save();
      
      return NextResponse.json(camera, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to create camera', details: error.message },
        { status: 400 }
      );
    }
  }
  