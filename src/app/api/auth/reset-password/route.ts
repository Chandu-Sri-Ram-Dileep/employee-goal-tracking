import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ message: "Email, token, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or reset request." }, { status: 400 });
    }

    // Verify token from recent audit log
    const recentAudit = await prisma.auditLog.findFirst({
      where: {
        userId: user.id,
        action: "FORGOT_PASSWORD_REQUESTED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!recentAudit || !recentAudit.remarks?.includes(token.toUpperCase())) {
      return NextResponse.json({ message: "Invalid or expired reset token." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "USER",
        entityId: user.id,
        remarks: "Password reset completed via token",
      },
    });

    return NextResponse.json({ message: "Password reset successful! You can now log in." });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Failed to reset password." }, { status: 500 });
  }
}
