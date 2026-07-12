import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;
    const employee =
      await prisma.employee.findUnique({
        where: {
          id: id,
        },

        include: {
          user: true,

          manager: {
            include: {
              user: true,
            },
          },

          profile: {
            include: {
              educations: true,
              projects: true,
              certifications: true,
              responsibilities: true,
            },
          },

          goalSheets: true,
        },
      });

    if (!employee) {
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

    return NextResponse.json(
      employee
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch employee",
      },
      {
        status: 500,
      }
    );
  }
}