import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

interface GoalWithCheckins {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: number;
  achievement: number;
  weightage: number;
  progress: number;
  status: string;
  checkins: Array<{ id: string; status: string }>;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: currentUser.id },
      include: {
        user: true,
        manager: { include: { user: { select: { name: true } } } },
      },
    });

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Get active cycle
    const activeCycle = await prisma.goalCycle.findFirst({
      where: { isActive: true },
    });

    // Get the latest goal sheet (active cycle preferred)
    const activeGoalSheet = activeCycle
      ? await prisma.goalSheet.findFirst({
          where: { employeeId: employee.id, cycleId: activeCycle.id },
          include: {
            goals: {
              include: {
                checkins: {
                  orderBy: { submittedAt: "desc" },
                  take: 1,
                },
              },
            },
            cycle: true,
          },
        })
      : null;

    // Fallback to most recent sheet
    const latestGoalSheet =
      activeGoalSheet ||
      (await prisma.goalSheet.findFirst({
        where: { employeeId: employee.id },
        include: {
          goals: {
            include: {
              checkins: {
                orderBy: { submittedAt: "desc" },
                take: 1,
              },
            },
          },
          cycle: true,
        },
        orderBy: { createdAt: "desc" },
      }));

    // Build goal stats
    const goals: GoalWithCheckins[] = (latestGoalSheet?.goals as unknown as GoalWithCheckins[]) ?? [];
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
    const onTrackGoals = goals.filter((g) => g.status === "ON_TRACK").length;
    const notStartedGoals = goals.filter((g) => g.status === "NOT_STARTED").length;

    // Weighted overall progress
    const overallProgress =
      totalGoals > 0
        ? Math.round(goals.reduce((acc: number, g: GoalWithCheckins) => acc + (g.progress * g.weightage) / 100, 0))
        : 0;

    // Pending check-ins (checkins with PENDING status)
    const pendingCheckins = goals.reduce((acc: number, g: GoalWithCheckins) => {
      const pendingCount = g.checkins.filter((c) => c.status === "PENDING").length;
      return acc + pendingCount;
    }, 0);

    // Recent goal list (top 5 by progress desc)
    const recentGoals = goals
      .slice()
      .sort((a: GoalWithCheckins, b: GoalWithCheckins) => b.progress - a.progress)
      .slice(0, 5)
      .map((g: GoalWithCheckins) => ({
        id: g.id,
        title: g.title,
        thrustArea: g.thrustArea,
        target: g.target,
        achievement: g.achievement,
        progress: g.progress,
        weightage: g.weightage,
        status: g.status,
        uom: g.uom,
      }));

    // Total goal sheets count across all cycles
    const totalSheets = await prisma.goalSheet.count({ where: { employeeId: employee.id } });

    // Goal unlock request status
    const unlockRequest = await prisma.goalUnlockRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ["PENDING_MANAGER", "PENDING_ADMIN"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.user.name,
        email: employee.user.email,
        employeeCode: employee.employeeCode,
        department: employee.department,
        designation: employee.designation,
        managerName: employee.manager?.user?.name ?? null,
      },
      activeCycle: activeCycle
        ? { id: activeCycle.id, name: activeCycle.name, startDate: activeCycle.startDate, endDate: activeCycle.endDate }
        : null,
      goalSheet: latestGoalSheet
        ? {
            id: latestGoalSheet.id,
            status: latestGoalSheet.status,
            isLocked: latestGoalSheet.isLocked,
            cycleName: latestGoalSheet.cycle.name,
            submittedAt: latestGoalSheet.submittedAt,
            approvedAt: latestGoalSheet.approvedAt,
          }
        : null,
      stats: {
        totalGoals,
        completedGoals,
        onTrackGoals,
        notStartedGoals,
        overallProgress,
        pendingCheckins,
        totalSheets,
      },
      recentGoals,
      hasUnlockRequest: !!unlockRequest,
    });
  } catch (error) {
    console.error("Employee dashboard error:", error);
    return NextResponse.json({ message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
