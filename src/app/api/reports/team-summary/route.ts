import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden: Manager role required" }, { status: 403 });
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager profile not found" }, { status: 404 });
    }

    const activeCycle = await prisma.goalCycle.findFirst({
      where: { isActive: true },
    });

    // Get reporting employees count
    const totalEmployees = await prisma.employee.count({
      where: { managerId: manager.id },
    });

    if (totalEmployees === 0 || !activeCycle) {
      return NextResponse.json({
        totalEmployees: 0,
        avgProgress: 0,
        totalGoalsAssigned: 0,
        totalGoalsCompleted: 0,
      });
    }

    // Get active goal sheets for reporting employees
    const goalSheets = await prisma.goalSheet.findMany({
      where: {
        cycleId: activeCycle.id,
        employee: {
          managerId: manager.id,
        },
      },
      include: {
        goals: true,
      },
    });

    let totalGoalsAssigned = 0;
    let totalGoalsCompleted = 0;
    let sumProgress = 0;

    goalSheets.forEach((sheet) => {
      totalGoalsAssigned += sheet.goals.length;
      totalGoalsCompleted += sheet.goals.filter((g) => g.status === "COMPLETED").length;

      // Calculate weighted progress for this sheet
      const sheetProgress = sheet.goals.reduce(
        (acc, goal) => acc + (goal.progress * goal.weightage) / 100,
        0
      );
      sumProgress += sheetProgress;
    });

    // The average progress is across all employees who have a goal sheet
    // If some employees don't have sheets, we count them as 0 progress
    const avgProgress = goalSheets.length > 0 
      ? Math.round(sumProgress / totalEmployees) 
      : 0;

    return NextResponse.json({
      totalEmployees,
      avgProgress,
      totalGoalsAssigned,
      totalGoalsCompleted,
    });
  } catch (error) {
    console.error("GET reports team-summary error:", error);
    return NextResponse.json({ message: "Failed to fetch team summary" }, { status: 500 });
  }
}
