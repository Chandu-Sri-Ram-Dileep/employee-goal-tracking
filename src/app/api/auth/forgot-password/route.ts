import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * POST /api/auth/forgot-password
 *
 * Generates a temporary 12-character password, hashes it, sets it as the
 * user's current password, and records the expiry (24 hours) in AuditLog.
 *
 * In production, wire up nodemailer/SendGrid here.
 * In development, the temp password is returned in the response body for
 * convenient testing — remove that before going live.
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

    // Generate a secure temp password: 4-hex + hyphen + 4-hex  e.g. "A3F1-92BC"
    const tempPassword =
      crypto.randomBytes(2).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(2).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(2).toString("hex").toUpperCase();

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 h

    const hashed = await bcrypt.hash(tempPassword, 10);

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

    // ─── TODO: Replace this console.log with real email delivery ────────────
    // Example with nodemailer:
    //   await transporter.sendMail({
    //     to: user.email,
    //     subject: "GoalTrack – Your Temporary Password",
    //     html: `<p>Your temporary password is: <strong>${tempPassword}</strong></p>
    //            <p>It expires in 24 hours. Log in and change it immediately.</p>`,
    //   });
    console.log(
      `[DEV] Temporary password for ${user.email}: ${tempPassword} (expires ${expiresAt.toISOString()})`
    );
    // ────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      message:
        "If an account with that email exists, a temporary password has been sent.",
      // ⚠️ DEV ONLY — remove before production:
      _devTempPassword: tempPassword,
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Failed to process request." }, { status: 500 });
  }
}
