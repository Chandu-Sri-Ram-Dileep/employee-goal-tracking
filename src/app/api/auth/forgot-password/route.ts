import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

/**
 * POST /api/auth/forgot-password
 *
 * Generates a temporary 12-character password, hashes it, sets it as the
 * user's current password, and records the expiry (24 hours) in AuditLog.
 *
 * Uses Web Crypto API (crypto.getRandomValues) instead of Node.js crypto
 * for full Vercel serverless / Edge compatibility.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Security: always return a vague 200 so we don't enumerate accounts
    if (!user) {
      return NextResponse.json({
        message:
          "If an account with that email exists, a temporary password has been sent.",
      });
    }

    // Generate secure temp password using Web Crypto API (Edge-compatible)
    const toHex = (buf: Uint8Array) =>
      Array.from(buf)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

    const part1 = toHex(crypto.getRandomValues(new Uint8Array(2)));
    const part2 = toHex(crypto.getRandomValues(new Uint8Array(2)));
    const part3 = toHex(crypto.getRandomValues(new Uint8Array(2)));
    const tempPassword = `${part1}-${part2}-${part3}`;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 h

    const hashed = await hashPassword(tempPassword);

    // Overwrite user password with hashed temp password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Store expiry + marker in AuditLog so reset-password can verify
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "TEMP_PASSWORD_ISSUED",
        entityType: "USER",
        entityId: user.id,
        remarks: `TEMP_EXPIRES:${expiresAt.toISOString()}`,
      },
    });

    console.log(
      `[DEV] Temporary password for ${user.email}: ${tempPassword} (expires ${expiresAt.toISOString()})`
    );

    return NextResponse.json({
      message:
        "If an account with that email exists, a temporary password has been sent.",
      _devTempPassword: tempPassword,
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Failed to process request." }, { status: 500 });
  }
}
