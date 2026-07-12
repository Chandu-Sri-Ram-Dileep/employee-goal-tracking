import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request
) {
  try {
    const body =
      await req.json();

    const { cycleId } =
      body;

    const cycle =
      await prisma.goalCycle.findUnique({
        where: {
          id: cycleId,
        },

        include: {
          goalSheets: true,
        },
      });

    if (!cycle) {
      return NextResponse.json(
        {
          message:
            "Goal Cycle not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      cycle.goalSheets.length > 0
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot delete cycle having Goal Sheets",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.checkinWindow.deleteMany({
      where: {
        cycleId,
      },
    });

    await prisma.goalCycle.delete({
      where: {
        id: cycleId,
      },
    });

    return NextResponse.json({
      message:
        "Goal Cycle deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to delete Goal Cycle",
      },
      {
        status: 500,
      }
    );
  }
}