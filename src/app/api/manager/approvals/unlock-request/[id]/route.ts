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

    const request =
      await prisma.goalUnlockRequest.findUnique({
        where: {
          id,
        },

        include: {
          employee: {
            include: {
              user: true,
              manager: {
                include: {
                  user: true,
                },
              },
            },
          },

          goalSheet: {
            include: {
              cycle: true,
              goals: true,
            },
          },
        },
      });

    if (!request) {
      return NextResponse.json(
        {
          message:
            "Request not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch unlock request",
      },
      {
        status: 500,
      }
    );
  }
}