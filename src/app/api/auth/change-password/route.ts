import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Old and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "PASSWORD_CHANGED",
        entityType: "USER",
        entityId: currentUser.id,
        remarks: "User updated their account password",
      },
    });

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Failed to update password." }, { status: 500 });
  }
}
