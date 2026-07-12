import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      requestId,
      remarks,
    } = body;

    const request =
      await prisma.goalUnlockRequest.findUnique({
        where: {
          id: requestId,
        },

        include: {
          employee: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!request) {
      return NextResponse.json(
        {
          message:
            "Request not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.goalSheet.update({
      where: {
        id: request.goalSheetId,
      },

      data: {
        isLocked: false,

        status:
          "RETURNED",
      },
    });

    await prisma.goalUnlockRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status:
          "APPROVED",

        adminRemarks:
          remarks,

        reviewedAt:
          new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId:
          request.employee.userId,

        action:
          "UNLOCK_REQUEST_ADMIN_APPROVED",

        entityType:
          "GOALSHEET",

        entityId:
          request.goalSheetId,

        remarks:
          remarks ||
          "Admin approved unlock request",
      },
    });

    return NextResponse.json({
      message:
        "Goal Sheet unlocked successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to approve request",
      },
      {
        status: 500,
      }
    );
  }
}