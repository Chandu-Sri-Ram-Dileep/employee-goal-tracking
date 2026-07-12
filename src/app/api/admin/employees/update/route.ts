import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      employeeId,
      name,
      email,
      department,
      designation,
      gender,
      phone,
      address,
      managerId,
      status,
    } = body;
    const existingEmployee =
  await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  });

if (!existingEmployee) {
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
const existingUser =
  await prisma.user.findFirst({
    where: {
      email,
      NOT: {
        id: existingEmployee.userId,
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
    const employee = await prisma.employee.update({
      where: {
        id: employeeId,
      },

      data: {
        department,
        designation,
        gender,
        phone,
        address,
        status,

        manager: managerId
          ? {
              connect: {
                id: managerId,
              },
            }
          : {
              disconnect: true,
            },

        user: {
          update: {
            name,
            email,
          },
        },
      },

      include: {
        user: true,

        manager: {
          include: {
            user: true,
          },
        },

        profile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: employee.userId,

        action: "EMPLOYEE_UPDATED",

        entityType: "EMPLOYEE",

        entityId: employee.id,

        remarks: `Employee ${employee.employeeCode} updated`,
      },
    });

    return NextResponse.json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to update employee",
      },
      {
        status: 500,
      }
    );
  }
}