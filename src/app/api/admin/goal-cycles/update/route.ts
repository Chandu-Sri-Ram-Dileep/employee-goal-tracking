import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      cycleId,

      name,
      description,

      startDate,
      endDate,

      goalOpenDate,
      goalCloseDate,

      q1OpenDate,
      q1CloseDate,

      q2OpenDate,
      q2CloseDate,

      q3OpenDate,
      q3CloseDate,

      q4OpenDate,
      q4CloseDate,

      status,
    } = body;

    const existingCycle =
      await prisma.goalCycle.findUnique({
        where: {
          id: cycleId,
        },

        include: {
          checkinWindows: true,
        },
      });

    if (!existingCycle) {
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

    const cycle =
      await prisma.goalCycle.update({
        where: {
          id: cycleId,
        },

        data: {
          name,
          description,

          startDate:
            new Date(startDate),

          endDate:
            new Date(endDate),

          goalOpenDate:
            new Date(goalOpenDate),

          goalCloseDate:
            new Date(goalCloseDate),

          status,
        },

        include: {
          checkinWindows: true,
        },
      });

    await prisma.checkinWindow.deleteMany({
      where: {
        cycleId,
      },
    });

    await prisma.checkinWindow.createMany({
      data: [
        {
          cycleId,
          period: "Q1",
          openDate:
            new Date(q1OpenDate),
          closeDate:
            new Date(q1CloseDate),
        },

        {
          cycleId,
          period: "Q2",
          openDate:
            new Date(q2OpenDate),
          closeDate:
            new Date(q2CloseDate),
        },

        {
          cycleId,
          period: "Q3",
          openDate:
            new Date(q3OpenDate),
          closeDate:
            new Date(q3CloseDate),
        },

        {
          cycleId,
          period: "Q4",
          openDate:
            new Date(q4OpenDate),
          closeDate:
            new Date(q4CloseDate),
        },
      ],
    });

    return NextResponse.json({
      message:
        "Goal Cycle updated successfully",

      cycle,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update Goal Cycle",
      },
      {
        status: 500,
      }
    );
  }
}