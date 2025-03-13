import mongoose from "mongoose";

type connectionConfig = {
  isConnected?: number;
};

const connection: connectionConfig = {};

export const connectDB = async () => {
  if (connection.isConnected === 1) {
    console.log("Already Connected");
    return;
  }

  console.log(process.env.MONGODB_URI);

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");


    connection.isConnected = db.connections[0].readyState;

    console.log("Database connected");
  } catch (error) {
    console.log("Server Error:", error);
    process.exit(1);
  }
}