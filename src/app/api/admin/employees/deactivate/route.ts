import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      employeeId,
      status,
    } = body;

    const employee =
      await prisma.employee.update({
        where: {
          id: employeeId,
        },

        data: {
          status,
        },
      });

    return NextResponse.json({
      message:
        "Employee status updated",

      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update employee status",
      },
      {
        status: 500,
      }
    );
  }
}