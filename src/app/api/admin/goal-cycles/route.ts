import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cycles =
      await prisma.goalCycle.findMany({
        include: {
          checkinWindows: true,
          goalSheets: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      cycles
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch Goal Cycles",
      },
      {
        status: 500,
      }
    );
  }
}