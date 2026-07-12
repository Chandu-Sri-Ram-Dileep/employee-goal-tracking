import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

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
          message: "Manager not found",
        },
        {
          status: 404,
        }
      );
    }

    const goalSheets =
      await prisma.goalSheet.findMany({
        where: {
          status: "SUBMITTED",

          employee: {
            managerId: manager.id,
          },
        },

        include: {
          employee: {
            include: {
              user: true,
            },
          },

          cycle: true,

          goals: true,
        },

        orderBy: {
          submittedAt: "desc",
        },
      });

    return NextResponse.json(goalSheets);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch pending Goal Sheets",
      },
      {
        status: 500,
      }
    );
  }
}