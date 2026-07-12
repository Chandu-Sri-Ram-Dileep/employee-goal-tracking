import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
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

    const requests =
      await prisma.goalUnlockRequest.findMany({
        where: {
          managerId: manager.id,
          status: "PENDING_MANAGER",
        },

        include: {
          employee: {
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
          requestedAt: "desc",
        },
      });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch requests",
      },
      {
        status: 500,
      }
    );
  }
}