import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const manager = await prisma.manager.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!manager) {
      return NextResponse.json(
        {
          message: "Manager not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    const {
      goalSheetId,
      remarks,
    } = body;

    if (
      !goalSheetId ||
      !remarks
    ) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet ID and remarks are required",
        },
        {
          status: 400,
        }
      );
    }

    const goalSheet =
      await prisma.goalSheet.findUnique({
        where: {
          id: goalSheetId,
        },
        include: {
          employee: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!goalSheet) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      goalSheet.employee.managerId !==
      manager.id
    ) {
      return NextResponse.json(
        {
          message:
            "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    if (
      goalSheet.status !==
      "SUBMITTED"
    ) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet is not awaiting approval",
        },
        {
          status: 400,
        }
      );
    }

    const updatedGoalSheet =
      await prisma.goalSheet.update({
        where: {
          id: goalSheetId,
        },
        data: {
          status: "RETURNED",
          isLocked: false,
          managerRemarks:
            remarks,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId:
          goalSheet.employee.userId,
        action:
          "GOALSHEET_RETURNED",
        entityType:
          "GOALSHEET",
        entityId:
          goalSheet.id,
        remarks: `Returned by ${user.name}. Remarks: ${remarks}`,
      },
    });

    return NextResponse.json({
      message:
        "Goal Sheet returned successfully",
      goalSheet:
        updatedGoalSheet,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to return Goal Sheet",
      },
      {
        status: 500,
      }
    );
  }
}