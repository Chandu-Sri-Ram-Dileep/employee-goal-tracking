import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body =
      await req.json();

    const { cycleId } =
      body;

    await prisma.goalCycle.updateMany({
      data: {
        isActive: false,
      },
    });

    const cycle =
      await prisma.goalCycle.update({
        where: {
          id: cycleId,
        },

        data: {
          isActive: true,

          status:
            "ACTIVE",
        },
      });

    return NextResponse.json({
      message:
        "Goal Cycle activated successfully",

      cycle,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to activate Goal Cycle",
      },
      {
        status: 500,
      }
    );
  }
}