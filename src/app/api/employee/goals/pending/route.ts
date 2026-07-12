import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const managerId =
      searchParams.get(
        "managerId"
      );

    if (!managerId) {
      return NextResponse.json(
        {
          message:
            "Manager ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const goalSheets =
      await prisma.goalSheet.findMany({
        where: {
          status:
            "SUBMITTED",

          employee: {
            managerId,
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
          submittedAt:
            "desc",
        },
      });

    return NextResponse.json(
      goalSheets
    );
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