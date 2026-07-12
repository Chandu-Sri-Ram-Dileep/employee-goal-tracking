import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body =
      await req.json();

    const { cycleId } =
      body;

    const cycle =
      await prisma.goalCycle.update({
        where: {
          id: cycleId,
        },

        data: {
          status:
            "CLOSED",

          isActive:
            false,
        },
      });

    return NextResponse.json({
      message:
        "Goal Cycle closed successfully",

      cycle,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to close Goal Cycle",
      },
      {
        status: 500,
      }
    );
  }
}