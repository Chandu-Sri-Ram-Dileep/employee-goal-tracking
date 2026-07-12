import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const employeeId =
      searchParams.get(
        "employeeId"
      );

    const requests =
      await prisma.goalUnlockRequest.findMany({
        where: {
          employeeId:
            employeeId || "",
        },

        include: {
          goalSheet: {
            include: {
              cycle: true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return NextResponse.json(
      requests
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch requests",
      },
      {
        status: 500,
      }
    );
  }
}