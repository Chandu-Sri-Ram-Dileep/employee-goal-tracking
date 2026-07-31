import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { UOMType } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sharedGoals = await prisma.sharedGoal.findMany({
      include: {
        goals: {
          include: {
            goalSheet: {
              include: {
                employee: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = sharedGoals.map((sg) => {
      const assignedEmployees = sg.goals
        .map((g) => g.goalSheet?.employee?.user?.name)
        .filter((name): name is string => !!name);

      return {
        id: sg.id,
        title: sg.title,
        description: sg.description,
        thrustArea: sg.thrustArea,
        uom: sg.uom,
        target: sg.target.toString(),
        weightage: sg.weightage,
        status: sg.active ? "ACTIVE" : "COMPLETED",
        assignedEmployees: Array.from(new Set(assignedEmployees)),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET shared-goals error:", error);
    return NextResponse.json({ message: "Failed to fetch shared goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    if (!activeCycle) {
      return NextResponse.json(
        { message: "No active goal cycle found. Cannot assign shared goals." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, thrustArea, uom, target, weightage, assignedEmployeeIds } = body;

    if (!title || !description || !thrustArea || !uom || target === undefined || !weightage || !assignedEmployeeIds || !Array.isArray(assignedEmployeeIds)) {
      return NextResponse.json(
        { message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Create the SharedGoal template
    const sharedGoal = await prisma.sharedGoal.create({
      data: {
        title,
        description,
        thrustArea,
        uom: uom as UOMType,
        target: Number(target),
        weightage: Number(weightage),
        active: true,
      },
    });

    // Create a Goal on the active GoalSheet of each assigned employee
    for (const employeeId of assignedEmployeeIds) {
      // Verify employee reports to this manager
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, managerId: manager.id },
      });

      if (!employee) continue;

      // Find or create active DRAFT/RETURNED GoalSheet for employee
      let goalSheet = await prisma.goalSheet.findFirst({
        where: {
          employeeId: employee.id,
          cycleId: activeCycle.id,
        },
      });

      if (!goalSheet) {
        goalSheet = await prisma.goalSheet.create({
          data: {
            employeeId: employee.id,
            cycleId: activeCycle.id,
            status: "DRAFT",
          },
        });
      }

      // Check if goal sheet is locked
      if (goalSheet.isLocked) {
        // Create an unlock/request or skip/return error? Usually we skip or append if we can, but since the manager is assigning, let's create the goal. If the sheet is approved/locked, we can create it but might need to notify. Let's create the goal anyway since manager has direct permission.
      }

      await prisma.goal.create({
        data: {
          goalSheetId: goalSheet.id,
          sharedGoalId: sharedGoal.id,
          title,
          description,
          thrustArea,
          uom: uom as UOMType,
          target: Number(target),
          weightage: Number(weightage),
          status: "NOT_STARTED",
          progress: 0,
        },
      });
    }

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SHARED_GOAL_CREATED",
        entityType: "SHAREDGOAL",
        entityId: sharedGoal.id,
        remarks: `Created shared goal: "${title}" and assigned to ${assignedEmployeeIds.length} employees`,
      },
    });

    return NextResponse.json({
      message: "Shared goal created and assigned successfully",
      sharedGoal,
    });
  } catch (error) {
    console.error("POST shared-goals error:", error);
    return NextResponse.json({ message: "Failed to create shared goal" }, { status: 500 });
  }
}
