import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { dbName: "dpd_label_system" })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
