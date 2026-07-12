import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees =
      await prisma.employee.findMany({
        include: {
          user: true,

          manager: {
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
      employees
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch employees",
      },
      {
        status: 500,
      }
    );
  }
}