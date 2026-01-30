import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.get("authorization") || "";
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
  return null;
}
