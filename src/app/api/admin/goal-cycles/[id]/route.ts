import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const cycle = await prisma.goalCycle.findUnique({
      where: {
        id,
      },
      include: {
        checkinWindows: true,
        goalSheets: {
          include: {
            employee: {
              include: {
                user: true,
                 manager:{
                            include:{
                                user:true
                            }
                        }
              },
            },
            goals:true
          },
        },
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { message: "Goal Cycle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(cycle);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch Goal Cycle" },
      { status: 500 }
    );
  }
}