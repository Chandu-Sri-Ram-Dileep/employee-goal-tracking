import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const managers =
      await prisma.manager.findMany({
        include: {
          user: true,
          employees: {
            include: {
              user: true,
            },
          },
          profile: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      managers
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch managers",
      },
      {
        status: 500,
      }
    );
  }
}