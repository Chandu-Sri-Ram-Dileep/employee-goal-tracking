import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests =
      await prisma.goalUnlockRequest.findMany({
        where: {
          status: "PENDING_ADMIN",
        },

        include: {
          employee: {
            include: {
              user: true,
            },
          },

          manager: {
            include: {
              user: true,
            },
          },

          goalSheet: {
            include: {
              cycle: true,
            },
          },
        },

        orderBy: {
          requestedAt:
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