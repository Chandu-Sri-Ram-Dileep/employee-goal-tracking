import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      employeeId,
      managerId,
    } = body;

    if (
      !employeeId ||
      !managerId
    ) {
      return NextResponse.json(
        {
          message:
            "Employee and Manager required",
        },
        {
          status: 400,
        }
      );
    }

    const employee =
      await prisma.employee.update({
        where: {
          id: employeeId,
        },

        data: {
          manager: {
            connect: {
              id: managerId,
            },
          },
        },

        include: {
          manager: {
            include: {
              user: true,
            },
          },
        },
      });

    return NextResponse.json({
      message:
        "Manager assigned successfully",

      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to assign manager",
      },
      {
        status: 500,
      }
    );
  }
}