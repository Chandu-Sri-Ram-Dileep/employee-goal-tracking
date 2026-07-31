import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeDate(d: string | undefined | null, fallbackDate: Date): Date {
  if (!d) return fallbackDate;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? fallbackDate : parsed;
}

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

    const existingCycle = await prisma.goalCycle.findUnique({
      where: { id: cycleId },
      include: { checkinWindows: true },
    });

    if (!existingCycle) {
      return NextResponse.json({ message: "Goal Cycle not found" }, { status: 404 });
    }

    const start = startDate ? new Date(startDate) : existingCycle.startDate;
    const end = endDate ? new Date(endDate) : existingCycle.endDate;

    const q1Start = start;
    const q1End = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

    const q2Start = q1End;
    const q2End = new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000);

    const q3Start = q2End;
    const q3End = new Date(start.getTime() + 270 * 24 * 60 * 60 * 1000);

    const q4Start = q3End;
    const q4End = end;

    const cycle = await prisma.goalCycle.update({
      where: { id: cycleId },
      data: {
        name: name ?? existingCycle.name,
        description: description ?? existingCycle.description,
        startDate: start,
        endDate: end,
        goalOpenDate: goalOpenDate ? new Date(goalOpenDate) : existingCycle.goalOpenDate,
        goalCloseDate: goalCloseDate ? new Date(goalCloseDate) : existingCycle.goalCloseDate,
        status: status ?? existingCycle.status,
      },
      include: { checkinWindows: true },
    });

    // Re-create checkin windows safely
    await prisma.checkinWindow.deleteMany({ where: { cycleId } });

    await prisma.checkinWindow.createMany({
      data: [
        {
          cycleId,
          period: "Q1",
          openDate: safeDate(q1OpenDate, q1Start),
          closeDate: safeDate(q1CloseDate, q1End),
        },
        {
          cycleId,
          period: "Q2",
          openDate: safeDate(q2OpenDate, q2Start),
          closeDate: safeDate(q2CloseDate, q2End),
        },
        {
          cycleId,
          period: "Q3",
          openDate: safeDate(q3OpenDate, q3Start),
          closeDate: safeDate(q3CloseDate, q3End),
        },
        {
          cycleId,
          period: "Q4",
          openDate: safeDate(q4OpenDate, q4Start),
          closeDate: safeDate(q4CloseDate, q4End),
        },
      ],
    });

    return NextResponse.json({
      message: "Goal Cycle updated successfully with Q1-Q4 check-in windows",
      cycle,
    });
  } catch (error: any) {
    console.error("Update Goal Cycle error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update Goal Cycle" },
      { status: 500 }
    );
  }
}