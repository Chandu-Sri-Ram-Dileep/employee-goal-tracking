import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { hashPassword } from "@/lib/password";

import { generatePassword } from "@/lib/generatePassword";

import { generateManagerCode } from "@/lib/generateManagerCode";

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
      gender,
      phone,
      address,
    } = body;

    if (
      !name ||
      !email ||
      !department ||
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

    const managerCode =
      await generateManagerCode();

    const temporaryPassword =
      generatePassword();

    const hashedPassword =
      await hashPassword(
        temporaryPassword
      );

    const manager =
      await prisma.manager.create({
        data: {
          managerCode,

          department,

          gender,

          phone,

          address,

          user: {
            create: {
              name,
              email,
              password:
                hashedPassword,
              role:
                "MANAGER",
            },
          },

          profile: {
            create: {},
          },
        },

        include: {
          user: true,
          profile: true,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId:
          manager.user.id,

        action:
          "MANAGER_CREATED",

        entityType:
          "MANAGER",

        entityId:
          manager.id,

        remarks:
          `Manager ${managerCode} created`,
      },
    });

    return NextResponse.json(
      {
        message:
          "Manager created successfully",

        managerCode,

        temporaryPassword,

        manager,
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
          "Failed to create manager",
      },
      {
        status: 500,
      }
    );
  }
}