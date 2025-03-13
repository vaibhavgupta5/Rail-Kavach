import { Train } from '@/models/Rail';
import { connectDB } from '@/utils/connectDB';
import { NextRequest, NextResponse } from 'next/server';

import '@/models/Rail';
import { Camera } from '@/models/Rail';


export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (status) filter.status = status;
    
    const trains = await Train.find(filter)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Train.countDocuments(filter);
    
    return NextResponse.json({
      data: trains,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch trains', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const train = new Train(body);
    await train.save();
    
    return NextResponse.json(train, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create train', details: error.message },
      { status: 400 }
    );
  }
}
