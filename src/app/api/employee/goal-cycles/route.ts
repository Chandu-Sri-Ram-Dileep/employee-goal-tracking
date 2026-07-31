import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: currentUser.id },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Get cycles that are either:
    // 1. Marked as isActive=true, OR
    // 2. Status=ACTIVE and within goal open/close window
    // This ensures employees can see cycles even if date filters are slightly off
    const now = new Date();

    const cycles = await prisma.goalCycle.findMany({
      where: {
        OR: [
          { isActive: true },
          {
            status: "ACTIVE",
            goalOpenDate: { lte: now },
            goalCloseDate: { gte: now },
          },
        ],
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(cycles);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch goal cycles" },
      { status: 500 }
    );
  }
}
