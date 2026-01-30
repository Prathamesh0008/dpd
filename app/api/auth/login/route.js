import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ ok: false, message: "Email and password required" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: body.email });
  if (!user) return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });

  const match = await bcrypt.compare(body.password, user.passwordHash);
  if (!match) return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });

  const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email, name: user.name });

  return NextResponse.json({
    ok: true,
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  });
}
