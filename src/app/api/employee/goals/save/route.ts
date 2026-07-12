import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
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
          message: "Employee not found",
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

    const body = await req.json();

    const { goals } = body;

    if (!Array.isArray(goals)) {
      return NextResponse.json(
        {
          message:
            "Goals are required",
        },
        {
          status: 400,
        }
      );
    }

    let goalSheet =
      await prisma.goalSheet.findFirst({
        where: {
          employeeId:
            employee.id,

          cycleId: cycle.id,
        },
      });

    if (!goalSheet) {
      goalSheet =
        await prisma.goalSheet.create({
          data: {
            employeeId:
              employee.id,

            cycleId: cycle.id,

            status: "DRAFT",

            isLocked: false,
          },
        });
    }

    if (goalSheet.isLocked) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet is locked",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.goal.deleteMany({
      where: {
        goalSheetId:
          goalSheet.id,
      },
    });

    await prisma.goal.createMany({
      data: goals.map(
        (goal: any) => ({
          goalSheetId:
            goalSheet.id,

          title: goal.title,

          description:
            goal.description,

          thrustArea:
            goal.thrustArea,

          uom: goal.uom,

          target: Number(
            goal.target
          ),

          weightage:
            Number(
              goal.weightage
            ),

          achievement: 0,

          progress: 0,

          status:
            "NOT_STARTED",
        })
      ),
    });

    await prisma.goalSheet.update({
      where: {
        id: goalSheet.id,
      },
      data: {
        status: "DRAFT",
        isLocked: false,
      },
    });

    return NextResponse.json({
      message:
        "Draft saved successfully",

      status:
        goalSheet.status,

      isLocked:
        goalSheet.isLocked,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to save draft",
      },
      {
        status: 500,
      }
    );
  }
}