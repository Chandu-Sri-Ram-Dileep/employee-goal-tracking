import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalUsers = await prisma.user.count();
    const totalEmployees = await prisma.employee.count();
    const totalManagers = await prisma.manager.count();
    const totalGoalCycles = await prisma.goalCycle.count();

    return NextResponse.json({
      user: adminUser,
      stats: {
        totalUsers,
        totalEmployees,
        totalManagers,
        totalGoalCycles,
      },
    });
  } catch (error: any) {
    console.error("GET admin profile error:", error);
    return NextResponse.json({ message: "Failed to fetch admin profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, profilePhoto } = await req.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : user.profilePhoto,
      },
    });

    return NextResponse.json({ message: "Admin profile updated successfully" });
  } catch (error: any) {
    console.error("POST admin profile error:", error);
    return NextResponse.json({ message: "Failed to update admin profile" }, { status: 500 });
  }
}
