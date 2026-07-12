import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
    });

    if (!manager) {
      return NextResponse.json(
        { message: "Manager not found" },
        { status: 404 }
      );
    }

    const checkin = await prisma.checkin.findUnique({
      where: { id },
      include: {
        goal: {
          include: {
            goalSheet: true,
          },
        },
      },
    });

    if (!checkin) {
      return NextResponse.json(
        { message: "Check-in not found" },
        { status: 404 }
      );
    }

    // Verify the check-in's goal belongs to one of this manager's employees
    const employee = await prisma.employee.findUnique({
      where: { id: checkin.goal.goalSheet.employeeId },
    });

    if (!employee || employee.managerId !== manager.id) {
      return NextResponse.json(
        { message: "Forbidden: This check-in does not belong to your team member" },
        { status: 403 }
      );
    }

    if (checkin.status !== "PENDING") {
      return NextResponse.json(
        { message: `Check-in is already reviewed (Status: ${checkin.status})` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { managerFeedback } = body;

    if (!managerFeedback || !managerFeedback.trim()) {
      return NextResponse.json(
        { message: "Feedback comment is required when returning a check-in" },
        { status: 400 }
      );
    }

    // Run in transaction to update checkin and log audit
    await prisma.$transaction([
      prisma.checkin.update({
        where: { id },
        data: {
          status: "RETURNED",
          managerFeedback: managerFeedback,
          reviewedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CHECKIN_RETURNED",
          entityType: "CHECKIN",
          entityId: checkin.id,
          remarks: `Returned check-in for goal: "${checkin.goal.title}" with feedback: "${managerFeedback}"`,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Check-in returned to employee successfully",
    });
  } catch (error) {
    console.error("Return checkin error:", error);
    return NextResponse.json(
      { message: "Failed to return check-in" },
      { status: 500 }
    );
  }
}
