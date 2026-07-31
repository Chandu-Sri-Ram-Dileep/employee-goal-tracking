import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "employee_goal_tracking_jwt_secret_key_2026";

export function generateToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}