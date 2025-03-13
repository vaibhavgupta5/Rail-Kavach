import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/utils/connectDB';
import { Alert, DetectionEvent } from '@/models/Rail';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const alertType = searchParams.get('alertType');
    const alertSeverity = searchParams.get('alertSeverity');
    const cameraId = searchParams.get('cameraId');
    const trainId = searchParams.get('trainId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (status) filter.status = status;
    if (alertType) filter.alertType = alertType;
    if (alertSeverity) filter.alertSeverity = alertSeverity;
    
    if (cameraId && mongoose.Types.ObjectId.isValid(cameraId)) {
      filter.camera = new mongoose.Types.ObjectId(cameraId);
    }
    
    if (trainId && mongoose.Types.ObjectId.isValid(trainId)) {
      filter.affectedTrains = new mongoose.Types.ObjectId(trainId);
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('camera', 'cameraId location railwaySection')
      .populate('eventId', 'animalType confidence imageUrl')
      .populate('affectedTrains', 'trainNumber trainName')
      .populate('notifiedStations', 'stationCode stationName')
      .lean();
    
    const total = await Alert.countDocuments(filter);
    
    return NextResponse.json({
      data: alerts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate that detection event exists
    if (!mongoose.Types.ObjectId.isValid(body.eventId)) {
      return NextResponse.json({ error: 'Invalid detection event ID' }, { status: 400 });
    }
    
    const detection = await DetectionEvent.findById(body.eventId);
    if (!detection) {
      return NextResponse.json({ error: 'Detection event not found' }, { status: 404 });
    }
    
    // Make sure camera ID is included
    if (!body.camera) {
      body.camera = detection.camera;
    }
    
    const alert = new Alert(body);
    await alert.save();
    
    // If trains are affected, process notifications for each train
    if (body.affectedTrains && body.affectedTrains.length > 0) {
      // In a real system, this would trigger notifications to train systems
      console.log(`Alert ${alert._id} sent to ${body.affectedTrains.length} trains`);
    }
    
    // If stations are notified, process notifications for each station
    if (body.notifiedStations && body.notifiedStations.length > 0) {
      // In a real system, this would trigger notifications to station systems
      console.log(`Alert ${alert._id} sent to ${body.notifiedStations.length} stations`);
    }
    
    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create alert', details: error.message },
      { status: 400 }
    );
  }
}
