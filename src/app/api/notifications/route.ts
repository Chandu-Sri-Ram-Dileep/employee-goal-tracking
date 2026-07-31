import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch latest system audit events for this user / role
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { userId: user.id },
          { entityType: "GOALSHEET" },
          { entityType: "CHECKIN" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const notifications = logs.map((log) => ({
      id: log.id,
      title: log.action.replace(/_/g, " "),
      description: log.remarks || `Action on ${log.entityType}`,
      timestamp: log.createdAt,
      read: false,
    }));

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
  }
}
