import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const employee = await prisma.employee.findUnique({
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

    const body = await req.json();

    const { goalSheetId, reason } = body;

    if (!goalSheetId || !reason) {
      return NextResponse.json(
        {
          message: "Goal Sheet and Reason are required",
        },
        {
          status: 400,
        }
      );
    }

    const goalSheet = await prisma.goalSheet.findUnique({
      where: {
        id: goalSheetId,
      },
      include: {
        employee: true,
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

    if (goalSheet.employeeId !== employee.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    if (!goalSheet.isLocked) {
      return NextResponse.json(
        {
          message: "Goal Sheet is already unlocked",
        },
        {
          status: 400,
        }
      );
    }

    const existingRequest =
      await prisma.goalUnlockRequest.findFirst({
        where: {
          goalSheetId,
          status: "PENDING_MANAGER",
        },
      });

    if (existingRequest) {
      return NextResponse.json(
        {
          message:
            "Pending unlock request already exists",
        },
        {
          status: 409,
        }
      );
    }

    const unlockRequest =
      await prisma.goalUnlockRequest.create({
        data: {
          goalSheetId,
          employeeId: employee.id,
          managerId: goalSheet.employee.managerId,
          reason,
          status: "PENDING_MANAGER",
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: employee.userId,
        action: "UNLOCK_REQUEST_CREATED",
        entityType: "GOALSHEET",
        entityId: goalSheetId,
        remarks: reason,
      },
    });

    return NextResponse.json({
      message:
        "Unlock request submitted successfully",
      unlockRequest,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create unlock request",
      },
      {
        status: 500,
      }
    );
  }
}