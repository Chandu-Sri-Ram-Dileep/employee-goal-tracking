import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      managerId,
      name,
      email,
      department,
      gender,
      phone,
      address,
      status,
    } = body;

    const existingManager =
      await prisma.manager.findUnique({
        where: {
          id: managerId,
        },
      });

    if (!existingManager) {
      return NextResponse.json(
        {
          message:
            "Manager not found",
        },
        {
          status: 404,
        }
      );
    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email,

          NOT: {
            id: existingManager.userId,
          },
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "Email already exists",
        },
        {
          status: 409,
        }
      );
    }

    const manager =
      await prisma.manager.update({
        where: {
          id: managerId,
        },

        data: {
          department,

          gender,

          phone,

          address,

          status,

          user: {
            update: {
              name,
              email,
            },
          },
        },

        include: {
          user: true,

          employees: {
            include: {
              user: true,
            },
          },

          profile: true,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId:
          manager.userId,

        action:
          "MANAGER_UPDATED",

        entityType:
          "MANAGER",

        entityId:
          manager.id,

        remarks: `Manager ${manager.managerCode} updated`,
      },
    });

    return NextResponse.json({
      message:
        "Manager updated successfully",

      manager,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update manager",
      },
      {
        status: 500,
      }
    );
  }
}