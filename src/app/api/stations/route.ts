import { Station } from '@/models/Rail';
import { connectDB } from '@/utils/connectDB';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { stationName: { $regex: search, $options: 'i' } },
        { stationCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [stations, totalCount] = await Promise.all([
      Station.find(query)
        .skip(skip)
        .limit(limit)
        .lean(),
      Station.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: stations,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const newStation = new Station({
      stationCode: body.stationCode,
      stationName: body.stationName,
      location: {
        type: 'Point',
        coordinates: body.location.coordinates
      },
      contactNumber: body.contactNumber,
      emergencyContact: body.emergencyContact
    });
    
    await newStation.save();
    
    return NextResponse.json(newStation, { status: 201 });
  } catch (error) {
    console.error('Error creating station:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Station code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create station' },
      { status: 500 }
    );
  }
}
