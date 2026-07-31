import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { profilePhoto } = await req.json();

    if (!profilePhoto) {
      return NextResponse.json({ message: "Profile photo URL is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profilePhoto },
      select: { id: true, name: true, email: true, profilePhoto: true },
    });

    return NextResponse.json({
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile photo update error:", error);
    return NextResponse.json({ message: "Failed to update profile photo" }, { status: 500 });
  }
}
