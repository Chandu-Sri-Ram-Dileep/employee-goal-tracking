import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Run employee & active cycle lookups in PARALLEL to eliminate serial latency
    const [employee, cycle] = await Promise.all([
      prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.goalCycle.findFirst({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    if (!cycle) {
      return NextResponse.json({
        goals: [],
        status: "DRAFT",
        cycleName: "",
      });
    }

    const goalSheet = await prisma.goalSheet.findFirst({
      where: {
        employeeId: employee.id,
        cycleId: cycle.id,
      },
      select: {
        id: true,
        status: true,
        isLocked: true,
        goals: {
          select: {
            id: true,
            title: true,
            description: true,
            thrustArea: true,
            uom: true,
            target: true,
            weightage: true,
            achievement: true,
            progress: true,
            status: true,
            managerFeedback: true,
          },
        },
      },
    });

    if (!goalSheet) {
      return NextResponse.json({
        goals: [],
        status: "DRAFT",
        cycleName: cycle.name,
      });
    }

    return NextResponse.json({
      cycleName: cycle.name,
      status: goalSheet.status,
      isLocked: goalSheet.isLocked,
      goalSheetId: goalSheet.id,

      goals: goalSheet.goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        thrustArea: goal.thrustArea,
        uom: goal.uom,
        target: goal.target.toString(),
        weightage: goal.weightage,
        achievement: goal.achievement,
        progress: goal.progress,
        status: goal.status,
        managerFeedback: goal.managerFeedback,
        goalType: "PERSONAL",
        isLocked: goalSheet.isLocked,
      })),
    });
  } catch (error) {
    console.error("GET /api/employee/goals error:", error);

    return NextResponse.json(
      { message: "Failed to load goals" },
      { status: 500 }
    );
  }
}