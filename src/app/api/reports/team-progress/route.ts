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

    const employees = await prisma.employee.findMany({
      where: { managerId: manager.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    const result = [];

    for (const employee of employees) {
      let goalsAssigned = 0;
      let goalsCompleted = 0;
      let progress = 0;

      if (activeCycle) {
        const goalSheet = await prisma.goalSheet.findFirst({
          where: {
            employeeId: employee.id,
            cycleId: activeCycle.id,
          },
          include: {
            goals: true,
          },
        });

        if (goalSheet) {
          goalsAssigned = goalSheet.goals.length;
          goalsCompleted = goalSheet.goals.filter((g) => g.status === "COMPLETED").length;
          progress = Math.round(
            goalSheet.goals.reduce((acc, goal) => acc + (goal.progress * goal.weightage) / 100, 0)
          );
        }
      }

      result.push({
        id: employee.id,
        employeeName: employee.user.name,
        department: employee.department,
        goalsAssigned,
        goalsCompleted,
        progress,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET reports team-progress error:", error);
    return NextResponse.json({ message: "Failed to fetch team progress" }, { status: 500 });
  }
}
