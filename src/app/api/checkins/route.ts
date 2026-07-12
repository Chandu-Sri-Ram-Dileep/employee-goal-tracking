import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { GoalStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
      });

      if (!employee) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }

      const cycle = await prisma.goalCycle.findFirst({
        where: { isActive: true },
      });

      if (!cycle) {
        return NextResponse.json({
          goals: [],
          cycleName: "",
        });
      }

      const goalSheet = await prisma.goalSheet.findFirst({
        where: {
          employeeId: employee.id,
          cycleId: cycle.id,
        },
        include: {
          goals: {
            include: {
              checkins: {
                orderBy: { submittedAt: "desc" },
              },
            },
          },
        },
      });

      if (!goalSheet) {
        return NextResponse.json({
          goals: [],
          cycleName: cycle.name,
          status: "DRAFT",
        });
      }

      // Format goals for employee checkins UI
      const formattedGoals = goalSheet.goals.map((goal) => {
        // Find if there is a pending check-in
        const pendingCheckin = goal.checkins.find((c) => c.status === "PENDING");
        const latestReviewedCheckin = goal.checkins.find((c) => c.status !== "PENDING");

        return {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          target: goal.target,
          uom: goal.uom,
          achievement: goal.achievement.toString(),
          comment: "",
          status: goal.status,
          progress: goal.progress,
          managerFeedback: latestReviewedCheckin?.managerFeedback || goal.managerFeedback || "",
          pendingCheckin: pendingCheckin
            ? {
                id: pendingCheckin.id,
                achievement: pendingCheckin.achievement,
                employeeComment: pendingCheckin.employeeComment,
                goalStatus: pendingCheckin.goalStatus,
                submittedAt: pendingCheckin.submittedAt,
              }
            : null,
          hasPending: !!pendingCheckin,
          goalSheetStatus: goalSheet.status,
        };
      });

      return NextResponse.json({
        cycleName: cycle.name,
        goalSheetStatus: goalSheet.status,
        isLocked: goalSheet.isLocked,
        goals: formattedGoals,
      });
    } else if (user.role === "MANAGER") {
      const manager = await prisma.manager.findUnique({
        where: { userId: user.id },
      });

      if (!manager) {
        return NextResponse.json(
          { message: "Manager not found" },
          { status: 404 }
        );
      }

      // Fetch all check-ins for the manager's team
      const checkins = await prisma.checkin.findMany({
        where: {
          goal: {
            goalSheet: {
              employee: {
                managerId: manager.id,
              },
            },
          },
        },
        include: {
          goal: {
            include: {
              goalSheet: {
                include: {
                  employee: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

      // Format for the manager checkins review UI
      const formattedCheckins = checkins.map((checkin) => {
        const employeeName = checkin.goal.goalSheet.employee.user.name;
        const department = checkin.goal.goalSheet.employee.department;

        return {
          id: checkin.id,
          employeeName,
          department,
          goalTitle: checkin.goal.title,
          goalDescription: checkin.goal.description,
          uom: checkin.goal.uom,
          target: checkin.goal.target,
          achievement: checkin.achievement,
          progress: Math.min(
            Math.round((checkin.achievement / checkin.goal.target) * 100),
            100
          ),
          employeeComment: checkin.employeeComment,
          managerFeedback: checkin.managerFeedback || "",
          submittedDate: checkin.submittedAt.toISOString().split("T")[0],
          status: checkin.status,
          goalStatus: checkin.goalStatus,
        };
      });

      return NextResponse.json(formattedCheckins);
    } else {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("GET checkins error:", error);
    return NextResponse.json(
      { message: "Failed to load check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Forbidden: Only employees can submit check-ins" },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee details not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { goalId, achievement, comment, status } = body;

    if (!goalId || achievement === undefined || !comment || !status) {
      return NextResponse.json(
        { message: "Missing required fields (goalId, achievement, comment, status)" },
        { status: 400 }
      );
    }

    // Verify goal exists and belongs to employee
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        goalSheet: true,
      },
    });

    if (!goal || goal.goalSheet.employeeId !== employee.id) {
      return NextResponse.json(
        { message: "Goal not found or does not belong to you" },
        { status: 404 }
      );
    }

    if (goal.goalSheet.status !== "APPROVED" && goal.goalSheet.status !== "LOCKED") {
      return NextResponse.json(
        { message: `Cannot check-in. Goal sheet is currently in ${goal.goalSheet.status} status. It must be APPROVED.` },
        { status: 400 }
      );
    }

    // Check if there is already a PENDING checkin for this goal
    const existingPending = await prisma.checkin.findFirst({
      where: {
        goalId,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { message: "A check-in is already pending approval for this goal" },
        { status: 400 }
      );
    }

    // Validate goalStatus value
    if (!Object.values(GoalStatus).includes(status as GoalStatus)) {
      return NextResponse.json(
        { message: `Invalid goal status: ${status}` },
        { status: 400 }
      );
    }

    // Create Checkin record
    const checkin = await prisma.checkin.create({
      data: {
        goalId,
        achievement: Number(achievement),
        employeeComment: comment,
        goalStatus: status as GoalStatus,
        status: "PENDING",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CHECKIN_SUBMITTED",
        entityType: "CHECKIN",
        entityId: checkin.id,
        remarks: `Submitted check-in for goal: "${goal.title}" with achievement ${achievement}`,
      },
    });

    return NextResponse.json({
      message: "Check-in submitted successfully",
      checkin,
    });
  } catch (error) {
    console.error("POST checkin error:", error);
    return NextResponse.json(
      { message: "Failed to submit check-in" },
      { status: 500 }
    );
  }
}
