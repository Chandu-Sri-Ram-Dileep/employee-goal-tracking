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

    // Try finding active cycle first, or fallback to most recent cycle
    let activeCycle = await prisma.goalCycle.findFirst({
      where: { isActive: true },
    });

    if (!activeCycle) {
      activeCycle = await prisma.goalCycle.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    // Where condition: if cycle exists, filter by cycleId (or allow all if no cycles exist at all)
    const whereCondition: any = {
      employee: {
        managerId: manager.id,
      },
    };

    if (activeCycle) {
      whereCondition.cycleId = activeCycle.id;
    }

    // Fetch all goal sheets for employees reporting to this manager
    const goalSheets = await prisma.goalSheet.findMany({
      where: whereCondition,
      include: {
        cycle: { select: { name: true } },
        employee: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        goals: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten goals and format them
    const teamGoals = goalSheets.flatMap((sheet) =>
      sheet.goals.map((goal) => ({
        id: goal.id,
        employeeName: sheet.employee.user.name,
        employeeCode: sheet.employee.employeeCode,
        department: sheet.employee.department,
        cycleName: sheet.cycle?.name || "N/A",
        sheetStatus: sheet.status,
        goalTitle: goal.title,
        description: goal.description,
        target: goal.target.toString(),
        achievement: goal.achievement.toString(),
        progress: goal.progress,
        weightage: goal.weightage,
        status: goal.status,
      }))
    );

    return NextResponse.json(teamGoals);
  } catch (error) {
    console.error("GET team-goals error:", error);
    return NextResponse.json({ message: "Failed to fetch team goals" }, { status: 500 });
  }
}
