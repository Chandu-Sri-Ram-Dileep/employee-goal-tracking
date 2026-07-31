import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });
    }

    // 1. Thrust Area Goal Distribution
    const thrustAreaGroups = await prisma.goal.groupBy({
      by: ["thrustArea"],
      _count: { id: true },
      _avg: { progress: true },
    });

    const thrustAreaData = thrustAreaGroups.map((g) => ({
      thrustArea: g.thrustArea,
      goalsCount: g._count.id,
      avgProgress: Math.round(g._avg.progress || 0),
    }));

    // 2. Manager Effectiveness
    const managers = await prisma.manager.findMany({
      include: {
        user: { select: { name: true, email: true } },
        employees: {
          include: {
            goalSheets: {
              include: {
                goals: {
                  include: { checkins: true },
                },
              },
            },
          },
        },
      },
    });

    const managerData = managers.map((m) => {
      const teamSize = m.employees.length;
      let totalCheckins = 0;
      let approvedCheckins = 0;
      let totalProgressSum = 0;
      let totalGoalCount = 0;

      m.employees.forEach((emp) => {
        emp.goalSheets.forEach((sheet) => {
          sheet.goals.forEach((goal) => {
            totalGoalCount++;
            totalProgressSum += goal.progress;
            totalCheckins += goal.checkins.length;
            approvedCheckins += goal.checkins.filter((c) => c.status === "APPROVED").length;
          });
        });
      });

      const checkinCompletion = totalCheckins > 0 ? Math.round((approvedCheckins / totalCheckins) * 100) : 100;
      const avgTeamProgress = totalGoalCount > 0 ? Math.round(totalProgressSum / totalGoalCount) : 0;

      return {
        id: m.id,
        managerName: m.user.name,
        department: m.department,
        teamSize,
        totalGoals: totalGoalCount,
        avgTeamProgress,
        checkinCompletion,
      };
    });

    // 3. Quarter-on-Quarter (QoQ) Achievement Calculation
    const allGoals = await prisma.goal.findMany({
      select: {
        progress: true,
        status: true,
        createdAt: true,
      },
    });

    const quarterlyMap: Record<string, { total: number; sumProgress: number }> = {
      Q1: { total: 0, sumProgress: 0 },
      Q2: { total: 0, sumProgress: 0 },
      Q3: { total: 0, sumProgress: 0 },
      Q4: { total: 0, sumProgress: 0 },
    };

    allGoals.forEach((goal) => {
      const month = new Date(goal.createdAt).getMonth(); // 0 to 11
      let q = "Q1";
      if (month >= 3 && month <= 5) q = "Q2";
      else if (month >= 6 && month <= 8) q = "Q3";
      else if (month >= 9) q = "Q4";

      quarterlyMap[q].total++;
      quarterlyMap[q].sumProgress += goal.progress;
    });

    const qoqData = Object.keys(quarterlyMap).map((q) => {
      const item = quarterlyMap[q];
      return {
        quarter: q,
        achievement: item.total > 0 ? Math.round(item.sumProgress / item.total) : 0,
        goalsCount: item.total,
      };
    });

    // Overall Summary
    const totalEmployees = await prisma.employee.count();
    const activeGoalsCount = await prisma.goal.count();
    const completedGoalsCount = await prisma.goal.count({ where: { status: "COMPLETED" } });
    const overallRate = activeGoalsCount > 0 ? Math.round((completedGoalsCount / activeGoalsCount) * 100) : 0;
    const pendingCheckinsCount = await prisma.checkin.count({ where: { status: "PENDING" } });

    return NextResponse.json({
      summary: {
        totalEmployees,
        activeGoalsCount,
        overallRate,
        pendingCheckinsCount,
      },
      qoqData,
      thrustAreaData,
      managerData,
    });
  } catch (error) {
    console.error("Admin analytics API error:", error);
    return NextResponse.json({ message: "Failed to fetch admin analytics data" }, { status: 500 });
  }
}
