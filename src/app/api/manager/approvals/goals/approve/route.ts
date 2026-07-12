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

    const { goalSheetId } = body;

    if (!goalSheetId) {
      return NextResponse.json(
        {
          message: "Goal Sheet ID is required",
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
          message: "Goal Sheet not found",
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
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    if (
      goalSheet.status !== "SUBMITTED"
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
          status: "APPROVED",
          isLocked: true,
          approvedAt: new Date(),
          approvedByManagerId:
            manager.id,
          managerRemarks: null,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId:
          goalSheet.employee.userId,
        action:
          "GOALSHEET_APPROVED",
        entityType:
          "GOALSHEET",
        entityId:
          goalSheet.id,
        remarks: `Approved by ${user.name}`,
      },
    });

    return NextResponse.json({
      message:
        "Goal Sheet approved successfully",
      goalSheet:
        updatedGoalSheet,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to approve Goal Sheet",
      },
      {
        status: 500,
      }
    );
  }
}