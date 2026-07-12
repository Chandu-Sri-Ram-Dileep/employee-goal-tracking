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
    const manager =
      await prisma.manager.findUnique({
        where: {
          id: id,
        },

        include: {
          user: true,

          employees: {
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
        },
      });

    if (!manager) {
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

    return NextResponse.json(
      manager
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch manager",
      },
      {
        status: 500,
      }
    );
  }
}