import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager not found" }, { status: 404 });
    }

    const activeCycle = await prisma.goalCycle.findFirst({ where: { isActive: true } });

    // Fetch all reporting employees
    const employees = await prisma.employee.findMany({
      where: { managerId: manager.id },
      include: { user: { select: { name: true, email: true } } },
    });
    const totalEmployees = employees.length;
    const employeeIds = employees.map((e) => e.id);

    // Fetch ALL goal sheets for reporting employees in the active cycle
    const goalSheets = activeCycle
      ? await prisma.goalSheet.findMany({
          where: {
            cycleId: activeCycle.id,
            employeeId: { in: employeeIds },
          },
          include: {
            goals: {
              include: { checkins: { where: { status: "PENDING" } } },
            },
            employee: { include: { user: { select: { name: true, email: true } } } },
            cycle: true,
          },
        })
      : [];

    // Map goal sheets by employeeId for quick lookup
    const sheetByEmployeeId = new Map(goalSheets.map((s) => [s.employeeId, s]));

    // Pending goal sheet approvals (SUBMITTED status)
    const pendingApprovals = goalSheets.filter((s) => s.status === "SUBMITTED").length;

    // Pending check-in reviews across all sheets
    const pendingCheckinReviews = goalSheets.reduce((acc, sheet) => {
      const sheetPendingCheckins = sheet.goals.reduce((gacc, g) => gacc + g.checkins.length, 0);
      return acc + sheetPendingCheckins;
    }, 0);

    // Goal statistics across team
    let totalGoals = 0;
    let completedGoals = 0;
    let onTrackGoals = 0;
    let notStartedGoals = 0;

    // Calculate progress for each employee
    let sumTeamProgress = 0;

    const employeeProgressList = employees.map((emp) => {
      const sheet = sheetByEmployeeId.get(emp.id);
      if (!sheet || sheet.goals.length === 0) {
        return {
          id: emp.id,
          name: emp.user.name,
          department: emp.department,
          designation: emp.designation,
          progress: 0,
          goalCount: 0,
          completedCount: 0,
          sheetStatus: sheet ? sheet.status : "NOT_CREATED",
        };
      }

      totalGoals += sheet.goals.length;
      completedGoals += sheet.goals.filter((g) => g.status === "COMPLETED").length;
      onTrackGoals += sheet.goals.filter((g) => g.status === "ON_TRACK").length;
      notStartedGoals += sheet.goals.filter((g) => g.status === "NOT_STARTED").length;

      const totalWeight = sheet.goals.reduce((sum, g) => sum + (g.weightage || 0), 0);
      const weightedProgressSum = sheet.goals.reduce(
        (sum, g) => sum + ((g.progress || 0) * (g.weightage || 0)) / 100,
        0
      );

      const empProgress =
        totalWeight > 0
          ? Math.min(100, Math.round((weightedProgressSum / totalWeight) * 100))
          : Math.round(
              sheet.goals.reduce((sum, g) => sum + (g.progress || 0), 0) / sheet.goals.length
            );

      sumTeamProgress += empProgress;

      return {
        id: emp.id,
        name: emp.user.name,
        department: emp.department,
        designation: emp.designation,
        progress: empProgress,
        goalCount: sheet.goals.length,
        completedCount: sheet.goals.filter((g) => g.status === "COMPLETED").length,
        sheetStatus: sheet.status,
      };
    });

    // Sort leaderboard by progress descending
    employeeProgressList.sort((a, b) => b.progress - a.progress);

    const employeesWithSheets = goalSheets.length;
    const employeesWithoutSheets = totalEmployees - employeesWithSheets;
    const avgTeamProgress =
      totalEmployees > 0 ? Math.round(sumTeamProgress / totalEmployees) : 0;

    // Pending unlock requests for this manager's employees
    const pendingUnlockRequests = await prisma.goalUnlockRequest.count({
      where: {
        status: "PENDING_MANAGER",
        employee: { managerId: manager.id },
      },
    });

    return NextResponse.json({
      manager: {
        id: manager.id,
        name: manager.user.name,
        email: manager.user.email,
        department: manager.department,
        designation: "Manager",
      },
      activeCycle: activeCycle
        ? {
            id: activeCycle.id,
            name: activeCycle.name,
            startDate: activeCycle.startDate,
            endDate: activeCycle.endDate,
          }
        : null,
      stats: {
        totalEmployees,
        employeesWithSheets,
        employeesWithoutSheets,
        pendingApprovals,
        pendingCheckinReviews,
        pendingUnlockRequests,
        totalGoals,
        completedGoals,
        onTrackGoals,
        notStartedGoals,
        avgTeamProgress,
      },
      employeeLeaderboard: employeeProgressList,
    });
  } catch (error) {
    console.error("Manager dashboard error:", error);
    return NextResponse.json({ message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
