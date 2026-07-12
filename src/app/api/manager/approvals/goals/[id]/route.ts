import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

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

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const manager =
      await prisma.manager.findUnique({
        where: {
          userId: user.id,
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

    const goalSheet =
      await prisma.goalSheet.findUnique({
        where: {
          id,
        },

        include: {
          employee: {
            include: {
              user: true,
            },
          },

          cycle: true,

          goals: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!goalSheet) {
      return NextResponse.json(
        {
          message:
            "Goal Sheet not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      goalSheet.employee.managerId !==
      manager.id
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      goalSheet
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch Goal Sheet",
      },
      {
        status: 500,
      }
    );
  }
}