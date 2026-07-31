import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });
    }

    // Counts
    const totalEmployees = await prisma.employee.count();
    const totalManagers = await prisma.manager.count();
    const totalCycles = await prisma.goalCycle.count();
    const totalSharedGoals = await prisma.sharedGoal.count({ where: { active: true } });

    // Active Goal Cycle
    const activeCycle = await prisma.goalCycle.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: { goalSheets: true },
        },
      },
    });

    // Pending Unlock Requests
    const pendingUnlockRequests = await prisma.goalUnlockRequest.count({
      where: { status: { in: ["PENDING_MANAGER", "PENDING_ADMIN"] } },
    });

    // Department Breakdown
    const employeesByDept = await prisma.employee.groupBy({
      by: ["department"],
      _count: { id: true },
    });

    const departmentCount = employeesByDept.length;

    // Total Goals and overall completion across active cycle
    const goalSheets = activeCycle
      ? await prisma.goalSheet.findMany({
          where: { cycleId: activeCycle.id },
          include: { goals: true },
        })
      : [];

    let totalGoalsAssigned = 0;
    let totalGoalsCompleted = 0;
    let sumProgress = 0;

    goalSheets.forEach((sheet) => {
      totalGoalsAssigned += sheet.goals.length;
      totalGoalsCompleted += sheet.goals.filter((g) => g.status === "COMPLETED").length;
      const sheetProgress = sheet.goals.reduce((acc, g) => acc + (g.progress * g.weightage) / 100, 0);
      sumProgress += sheetProgress;
    });

    const avgGoalProgress = goalSheets.length > 0 ? Math.round(sumProgress / goalSheets.length) : 0;

    return NextResponse.json({
      stats: {
        totalEmployees,
        totalManagers,
        totalCycles,
        departmentCount,
        pendingUnlockRequests,
        totalSharedGoals,
        totalGoalsAssigned,
        totalGoalsCompleted,
        avgGoalProgress,
      },
      activeCycle: activeCycle
        ? {
            id: activeCycle.id,
            name: activeCycle.name,
            startDate: activeCycle.startDate,
            endDate: activeCycle.endDate,
            goalSheetsCount: activeCycle._count.goalSheets,
          }
        : null,
      departments: employeesByDept.map((d) => ({
        department: d.department,
        employeeCount: d._count.id,
      })),
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json({ message: "Failed to fetch admin dashboard statistics" }, { status: 500 });
  }
}
