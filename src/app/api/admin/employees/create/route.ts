import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { hashPassword } from "@/lib/password";

import { generatePassword } from "@/lib/generatePassword";

import { generateEmployeeCode } from "@/lib/generateEmployeeCode";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      name,
      email,
      department,
      designation,
      gender,
      phone,
      address,
      managerId,
    } = body;

    if (
      !name ||
      !email ||
      !department ||
      !designation ||
      !gender
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
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

    const employeeCode =
      await generateEmployeeCode();

    const temporaryPassword =
      generatePassword();

    const hashedPassword =
      await hashPassword(
        temporaryPassword
      );

    const employee =
      await prisma.employee.create({
        data: {
          employeeCode,

          department,

          designation,

          gender,

          phone,

          address,

          manager: managerId
            ? {
                connect: {
                  id: managerId,
                },
              }
            : undefined,

          user: {
            create: {
              name,

              email,

              password:
                hashedPassword,

              role:
                "EMPLOYEE",
            },
          },

          profile: {
            create: {},
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
        userId:
          employee.user.id,

        action:
          "EMPLOYEE_CREATED",

        entityType:
          "EMPLOYEE",

        entityId:
          employee.id,

        remarks:
          `Employee ${employeeCode} created`,
      },
    });

    return NextResponse.json(
      {
        message:
          "Employee created successfully",

        employeeCode,

        temporaryPassword,

        employee,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create employee",
      },
      {
        status: 500,
      }
    );
  }
}