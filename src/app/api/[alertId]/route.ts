import { Alert } from "@/models/Rail";
import { connectDB } from "@/utils/connectDB";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    await connectDB();
    
    const { alertId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID format' }, { status: 400 });
    }
    
    const alert = await Alert.findById(alertId)
      .populate('camera', 'cameraId location railwaySection')
      .populate('eventId')
      .populate('affectedTrains', 'trainNumber trainName currentLocation')
      .populate('notifiedStations', 'stationCode stationName')
      .lean();
    
    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch alert details', details: error.message },
      { status: 500 }
    );
  }
}
