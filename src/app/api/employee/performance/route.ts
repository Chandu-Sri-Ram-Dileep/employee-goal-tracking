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
      include: {
        user: true,
        manager: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Get all goal sheets for this employee
    const goalSheets = await prisma.goalSheet.findMany({
      where: { employeeId: employee.id },
      include: {
        goals: true,
        cycle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ─── Performance Calculation Logic ───────────────────────────────────────
    //
    // Performance is calculated as a weighted average of goal progress:
    //   - Each goal has a `weightage` (e.g., 30%) and a `progress` (0–100%)
    //   - Goal contribution = (progress / 100) × weightage
    //   - Overall performance = sum of all goal contributions / total weightage × 100
    //
    // Example:
    //   Goal A: 30% weight, 80% progress → contributes 24
    //   Goal B: 70% weight, 50% progress → contributes 35
    //   Overall = (24 + 35) / (30 + 70) × 100 = 59%
    //
    // For the COMPLETED bonus (historical tracking), goals with status=COMPLETED
    // also contribute to `completedGoals` and `achievedWeightage`.
    // ─────────────────────────────────────────────────────────────────────────

    let totalGoals = 0;
    let completedGoals = 0;
    let onTrackGoals = 0;
    let notStartedGoals = 0;
    let totalWeightage = 0;
    let weightedProgressSum = 0; // sum of (progress × weightage)

    const goalDetails = [];

    for (const sheet of goalSheets) {
      for (const goal of sheet.goals) {
        totalGoals++;
        totalWeightage += goal.weightage;
        weightedProgressSum += (goal.progress / 100) * goal.weightage;

        if (goal.status === "COMPLETED") {
          completedGoals++;
        } else if (goal.status === "ON_TRACK") {
          onTrackGoals++;
        } else {
          notStartedGoals++;
        }

        // Individual goal performance contribution (as a percentage of total possible)
        const goalPerformanceScore =
          totalWeightage > 0
            ? parseFloat(((goal.progress / 100) * goal.weightage).toFixed(2))
            : 0;

        goalDetails.push({
          id: goal.id,
          title: goal.title,
          thrustArea: goal.thrustArea,
          target: goal.target,
          achievement: goal.achievement,
          progress: goal.progress,
          weightage: goal.weightage,
          status: goal.status,
          performanceScore: goalPerformanceScore,
          cycle: sheet.cycle.name,
          startDate: sheet.createdAt,
          endDate: sheet.approvedAt || new Date(),
        });
      }
    }

    // Overall performance = weighted average of progress across all goals
    const overallPerformance =
      totalWeightage > 0
        ? Math.min(100, Math.round((weightedProgressSum / totalWeightage) * 100))
        : 0;

    // Achieved weightage = sum of weightage for COMPLETED goals only
    const achievedWeightage = goalDetails
      .filter((g) => g.status === "COMPLETED")
      .reduce((sum, g) => sum + g.weightage, 0);

    // ─── Departmental Ranking ────────────────────────────────────────────────
    const departmentEmployees = await prisma.employee.findMany({
      where: {
        department: employee.department,
        status: "ACTIVE",
      },
      include: {
        user: true,
        goalSheets: {
          include: {
            goals: true,
          },
        },
      },
    });

    const employeeRankings = departmentEmployees.map((emp) => {
      let empTotalWeightage = 0;
      let empWeightedProgressSum = 0;

      for (const sheet of emp.goalSheets) {
        for (const goal of sheet.goals) {
          empTotalWeightage += goal.weightage;
          empWeightedProgressSum += (goal.progress / 100) * goal.weightage;
        }
      }

      const empPerformance =
        empTotalWeightage > 0
          ? Math.min(100, Math.round((empWeightedProgressSum / empTotalWeightage) * 100))
          : 0;

      return {
        employeeId: emp.id,
        employeeName: emp.user.name,
        performance: empPerformance,
      };
    });

    // Sort by performance descending
    employeeRankings.sort((a, b) => b.performance - a.performance);

    // Find current employee's rank
    const currentRank =
      employeeRankings.findIndex((rank) => rank.employeeId === employee.id) + 1;
    const totalEmployees = employeeRankings.length;

    // Top 5 performers in department
    const topPerformers = employeeRankings.slice(0, 5);

    return NextResponse.json({
      summary: {
        totalGoals,
        completedGoals,
        onTrackGoals,
        notStartedGoals,
        overallPerformance,
        totalWeightage,
        achievedWeightage,
      },
      goalDetails,
      ranking: {
        currentRank,
        totalEmployees,
        percentile:
          totalEmployees > 0
            ? Math.round(((totalEmployees - currentRank + 1) / totalEmployees) * 100)
            : 0,
      },
      topPerformers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
