import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeDate(d: string | undefined | null, fallbackDate: Date): Date {
  if (!d) return fallbackDate;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? fallbackDate : parsed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
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
    } = body;

    if (!name || !startDate || !endDate || !goalOpenDate || !goalCloseDate) {
      return NextResponse.json(
        { message: "Required cycle dates missing (name, startDate, endDate, goalOpenDate, goalCloseDate)" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Compute automatic quarterly fallbacks if user leaves quarterly dates blank
    const q1Start = start;
    const q1End = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

    const q2Start = q1End;
    const q2End = new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000);

    const q3Start = q2End;
    const q3End = new Date(start.getTime() + 270 * 24 * 60 * 60 * 1000);

    const q4Start = q3End;
    const q4End = end;

    const cycle = await prisma.goalCycle.create({
      data: {
        name,
        description: description || null,
        startDate: start,
        endDate: end,
        goalOpenDate: new Date(goalOpenDate),
        goalCloseDate: new Date(goalCloseDate),
        status: "DRAFT",
        isActive: false,
        checkinWindows: {
          create: [
            {
              period: "Q1",
              openDate: safeDate(q1OpenDate, q1Start),
              closeDate: safeDate(q1CloseDate, q1End),
            },
            {
              period: "Q2",
              openDate: safeDate(q2OpenDate, q2Start),
              closeDate: safeDate(q2CloseDate, q2End),
            },
            {
              period: "Q3",
              openDate: safeDate(q3OpenDate, q3Start),
              closeDate: safeDate(q3CloseDate, q3End),
            },
            {
              period: "Q4",
              openDate: safeDate(q4OpenDate, q4Start),
              closeDate: safeDate(q4CloseDate, q4End),
            },
          ],
        },
      },
      include: {
        checkinWindows: true,
      },
    });

    return NextResponse.json(
      {
        message: "Goal Cycle created successfully with Q1-Q4 check-in windows",
        cycle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Goal Cycle error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create Goal Cycle" },
      { status: 500 }
    );
  }
}