import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: currentUser.id },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    const { cycleId } = await req.json();

    if (!cycleId) {
      return NextResponse.json(
        { message: "Cycle ID is required" },
        { status: 400 }
      );
    }

    // Check if cycle exists and is active
    const cycle = await prisma.goalCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return NextResponse.json(
        { message: "Goal cycle not found" },
        { status: 404 }
      );
    }

    if (cycle.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Goal cycle is not active" },
        { status: 400 }
      );
    }

    // Check if employee already has a goal sheet for this cycle
    const existingSheet = await prisma.goalSheet.findFirst({
      where: {
        employeeId: employee.id,
        cycleId: cycleId,
      },
    });

    if (existingSheet) {
      return NextResponse.json(
        { message: "You already have a goal sheet for this cycle" },
        { status: 400 }
      );
    }

    // Create new goal sheet
    const goalSheet = await prisma.goalSheet.create({
      data: {
        employeeId: employee.id,
        cycleId: cycleId,
        status: "DRAFT",
        isLocked: false,
      },
      include: {
        cycle: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "GOAL_SHEET_CREATED",
        entityType: "GOALSHEET",
        entityId: goalSheet.id,
        remarks: `Created new goal sheet for cycle: ${cycle.name}`,
      },
    });

    return NextResponse.json(goalSheet);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create goal sheet" },
      { status: 500 }
    );
  }
}
