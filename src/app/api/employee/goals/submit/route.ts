import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PUT() {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const employee =
      await prisma.employee.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!employee) {
      return NextResponse.json(
        {
          message:
            "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    const cycle =
      await prisma.goalCycle.findFirst({
        where: {
          isActive: true,
        },
      });

    if (!cycle) {
      return NextResponse.json(
        {
          message:
            "No active Goal Cycle",
        },
        {
          status: 400,
        }
      );
    }

    const goalSheet =
      await prisma.goalSheet.findFirst({
        where: {
          employeeId:
            employee.id,

          cycleId:
            cycle.id,
        },

        include: {
          employee: {
            include: {
              user: true,
            },
          },

          goals: true,
        },
      });

    if (!goalSheet) {
      return NextResponse.json(
        {
          message:
            "No Goal Sheet found",
        },
        {
          status: 404,
        }
      );
    }

    if (goalSheet.isLocked) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet is already locked",
        },
        {
          status: 400,
        }
      );
    }

    if (
      goalSheet.goals.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Add at least one goal before submission",
        },
        {
          status: 400,
        }
      );
    }

    const totalWeightage =
      goalSheet.goals.reduce(
        (sum, goal) =>
          sum +
          goal.weightage,
        0
      );

    if (
      totalWeightage !==
      100
    ) {
      return NextResponse.json(
        {
          message:
            "Total weightage must be exactly 100",
        },
        {
          status: 400,
        }
      );
    }

    const updatedGoalSheet =
      await prisma.goalSheet.update({
        where: {
          id: goalSheet.id,
        },

        data: {
          status:
            "SUBMITTED",

          submittedAt:
            new Date(),
          isLocked:true,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId:
          goalSheet.employee.userId,

        action:
          "GOALSHEET_SUBMITTED",

        entityType:
          "GOALSHEET",

        entityId:
          goalSheet.id,

        remarks: `Goal Sheet submitted by ${goalSheet.employee.user.name}`,
      },
    });

    return NextResponse.json({
      message:
        "Goal Sheet submitted successfully",

      goalSheet:
        updatedGoalSheet,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to submit Goal Sheet",
      },
      {
        status: 500,
      }
    );
  }
}