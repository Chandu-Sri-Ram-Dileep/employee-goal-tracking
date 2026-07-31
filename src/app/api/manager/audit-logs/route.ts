import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: currentUser.id },
      include: {
        employees: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!manager) {
      return NextResponse.json(
        { message: "Manager not found" },
        { status: 404 }
      );
    }

    // Get manager's own user ID and all their employees' user IDs
    const userIds = [currentUser.id, ...manager.employees.map((e) => e.userId)];

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
