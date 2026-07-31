import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden: Manager role required" }, { status: 403 });
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager profile not found" }, { status: 404 });
    }

    const activeCycle = await prisma.goalCycle.findFirst({
      where: { isActive: true },
    });

    // Fetch all employees reporting to this manager
    const employees = await prisma.employee.findMany({
      where: { managerId: manager.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    const result = [];

    for (const employee of employees) {
      let goalSheetStatus = "DRAFT";
      let overallProgress = 0;
      let checkinStatus = "PENDING";
      let goalSheetId = null;
      let goalsList: any[] = [];

      if (activeCycle) {
        const goalSheet = await prisma.goalSheet.findFirst({
          where: {
            employeeId: employee.id,
            cycleId: activeCycle.id,
          },
          include: {
            goals: {
              include: {
                checkins: true,
              },
            },
          },
        });

        if (goalSheet) {
          goalSheetId = goalSheet.id;
          goalSheetStatus = goalSheet.status;

          // Calculate overall progress: Sum(progress * weightage / 100)
          overallProgress = Math.round(
            goalSheet.goals.reduce((acc, goal) => acc + (goal.progress * goal.weightage) / 100, 0)
          );

          goalsList = goalSheet.goals.map((g) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            thrustArea: g.thrustArea,
            uom: g.uom,
            target: g.target,
            achievement: g.achievement,
            weightage: g.weightage,
            progress: g.progress,
            status: g.status,
          }));

          // Determine check-in status
          const checkins = goalSheet.goals.flatMap((g) => g.checkins);
          if (checkins.length > 0) {
            const hasPending = checkins.some((c) => c.status === "PENDING");
            if (hasPending) {
              checkinStatus = "SUBMITTED"; // Submitted for review
            } else {
              checkinStatus = "APPROVED"; // All reviewed
            }
          }
        }
      }

      result.push({
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.user.name,
        email: employee.user.email,
        department: employee.department,
        designation: employee.designation,
        goalSheetId,
        goalSheetStatus,
        checkinStatus,
        overallProgress,
        goals: goalsList,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET my-employees error:", error);
    return NextResponse.json({ message: "Failed to fetch reporting employees" }, { status: 500 });
  }
}
