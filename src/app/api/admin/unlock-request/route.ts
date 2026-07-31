import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

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