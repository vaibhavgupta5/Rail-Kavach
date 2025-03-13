import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/connectDB";
import { Camera } from "@/models/Rail";

export async function GET({ params }: { params: { cameraId: string } }) {
  try {
    await connectDB();

    const { cameraId } = params;

    if (!mongoose.Types.ObjectId.isValid(cameraId)) {
      return NextResponse.json(
        { error: "Invalid camera ID format" },
        { status: 400 }
      );
    }

    const camera = await Camera.findById(cameraId)
      .populate("nearestStation", "stationName stationCode location")
      .lean();

    if (!camera) {
      return NextResponse.json({ error: "Camera not found" }, { status: 404 });
    }

    return NextResponse.json(camera);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch camera details", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    await connectDB();

    const { cameraId } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(cameraId)) {
      return NextResponse.json(
        { error: "Invalid camera ID format" },
        { status: 400 }
      );
    }

    const camera = await Camera.findByIdAndUpdate(
      cameraId,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!camera) {
      return NextResponse.json({ error: "Camera not found" }, { status: 404 });
    }

    return NextResponse.json(camera);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update camera", details: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    await connectDB();

    const { cameraId } = params;

    if (!mongoose.Types.ObjectId.isValid(cameraId)) {
      return NextResponse.json(
        { error: "Invalid camera ID format" },
        { status: 400 }
      );
    }

    // Using soft delete by updating status
    const camera = await Camera.findByIdAndUpdate(
      cameraId,
      { $set: { status: "inactive" } },
      { new: true }
    ).lean();

    if (!camera) {
      return NextResponse.json({ error: "Camera not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Camera deactivated successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to deactivate camera", details: error.message },
      { status: 500 }
    );
  }
}
