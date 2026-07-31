import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const managers = await prisma.manager.findMany({
      select: {
        id: true,
        managerCode: true,
        department: true,
        gender: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            employeeCode: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(managers);
  } catch (error) {
    console.error("GET /api/admin/managers error:", error);

    return NextResponse.json(
      { message: "Failed to fetch managers" },
      { status: 500 }
    );
  }
}