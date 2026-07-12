import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (
      !name ||
      !startDate ||
      !endDate ||
      !goalOpenDate ||
      !goalCloseDate
    ) {
      return NextResponse.json(
        {
          message:
            "Required fields missing",
        },
        {
          status: 400,
        }
      );
    }

    const cycle =
      await prisma.goalCycle.create({
        data: {
          name,
          description,

          startDate: new Date(
            startDate
          ),

          endDate: new Date(
            endDate
          ),

          goalOpenDate:
            new Date(
              goalOpenDate
            ),

          goalCloseDate:
            new Date(
              goalCloseDate
            ),

          status: "DRAFT",

          isActive: false,

          checkinWindows: {
            create: [
              {
                period: "Q1",
                openDate:
                  new Date(
                    q1OpenDate
                  ),
                closeDate:
                  new Date(
                    q1CloseDate
                  ),
              },

              {
                period: "Q2",
                openDate:
                  new Date(
                    q2OpenDate
                  ),
                closeDate:
                  new Date(
                    q2CloseDate
                  ),
              },

              {
                period: "Q3",
                openDate:
                  new Date(
                    q3OpenDate
                  ),
                closeDate:
                  new Date(
                    q3CloseDate
                  ),
              },

              {
                period: "Q4",
                openDate:
                  new Date(
                    q4OpenDate
                  ),
                closeDate:
                  new Date(
                    q4CloseDate
                  ),
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
        message:
          "Goal Cycle created successfully",

        cycle,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create Goal Cycle",
      },
      {
        status: 500,
      }
    );
  }
}