import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  await connectDB();

  const users = [
    { name: "Admin", email: "admin@demo.com", password: "admin123", role: "admin" },
    { name: "User 1", email: "user1@demo.com", password: "user123", role: "user" },
    { name: "User 2", email: "user2@demo.com", password: "user123", role: "user" },
    { name: "User 3", email: "user3@demo.com", password: "user123", role: "user" },
    { name: "User 4", email: "user4@demo.com", password: "user123", role: "user" },
    { name: "User 5", email: "user5@demo.com", password: "user123", role: "user" },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    }
  }

  return NextResponse.json({ ok: true, message: "Seed completed" });
}
