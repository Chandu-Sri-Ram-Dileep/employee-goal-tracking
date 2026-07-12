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

    await prisma.goalUnlockRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status:
          "REJECTED",

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
          "UNLOCK_REQUEST_ADMIN_REJECTED",

        entityType:
          "GOALSHEET",

        entityId:
          request.goalSheetId,

        remarks:
          remarks,
      },
    });

    return NextResponse.json({
      message:
        "Unlock request rejected",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to reject request",
      },
      {
        status: 500,
      }
    );
  }
}