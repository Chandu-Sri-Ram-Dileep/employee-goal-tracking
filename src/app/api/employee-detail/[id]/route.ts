import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: employeeId } = params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePhoto: true,
            createdAt: true,
          },
        },
        manager: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        profile: {
          include: {
            educations: true,
            projects: true,
            certifications: true,
          },
        },
        goalSheets: {
          include: {
            cycle: { select: { name: true, startDate: true, endDate: true } },
            goals: {
              include: {
                checkins: {
                  orderBy: { submittedAt: "desc" },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Flatten all goals across goal sheets
    const allGoals = employee.goalSheets.flatMap((sheet) =>
      sheet.goals.map((g) => ({
        id: g.id,
        goalSheetId: sheet.id,
        cycleName: sheet.cycle?.name || "N/A",
        sheetStatus: sheet.status,
        title: g.title,
        description: g.description,
        thrustArea: g.thrustArea,
        uom: g.uom,
        target: g.target,
        achievement: g.achievement,
        weightage: g.weightage,
        progress: g.progress,
        status: g.status,
        managerFeedback: g.managerFeedback,
      }))
    );

    // Flatten all check-ins
    const allCheckins = employee.goalSheets.flatMap((sheet) =>
      sheet.goals.flatMap((g) =>
        g.checkins.map((c) => ({
          id: c.id,
          goalId: g.id,
          goalTitle: g.title,
          cycleName: sheet.cycle?.name || "N/A",
          achievement: c.achievement,
          employeeComment: c.employeeComment,
          managerFeedback: c.managerFeedback,
          status: c.status,
          goalStatus: c.goalStatus,
          submittedAt: c.submittedAt,
          reviewedAt: c.reviewedAt,
        }))
      )
    );

    // Sort checkins newest first
    allCheckins.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // Calculate overall progress across latest active/submitted sheet
    const activeSheet = employee.goalSheets[0];
    let overallProgress = 0;
    if (activeSheet && activeSheet.goals.length > 0) {
      overallProgress = Math.round(
        activeSheet.goals.reduce((acc, g) => acc + (g.progress * g.weightage) / 100, 0)
      );
    }

    const completedGoalsCount = allGoals.filter((g) => g.status === "COMPLETED").length;

    return NextResponse.json({
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.user.name,
      email: employee.user.email,
      profilePhoto: employee.user.profilePhoto,
      joinedAt: employee.user.createdAt,
      phone: employee.phone || "Not provided",
      address: employee.address || "Not provided",
      gender: employee.gender,
      department: employee.department,
      designation: employee.designation,
      status: employee.status,
      manager: employee.manager
        ? {
            id: employee.manager.id,
            managerCode: employee.manager.managerCode,
            name: employee.manager.user.name,
            email: employee.manager.user.email,
            department: employee.manager.department,
          }
        : null,
      profile: employee.profile || {
        summary: null,
        totalExperience: null,
        educations: [],
        projects: [],
        certifications: [],
      },
      stats: {
        overallProgress,
        totalGoals: allGoals.length,
        completedGoals: completedGoalsCount,
        totalCheckins: allCheckins.length,
      },
      goals: allGoals,
      checkins: allCheckins,
    });
  } catch (error: any) {
    console.error("GET employee-detail error:", error);
    return NextResponse.json({ message: "Failed to fetch employee detail" }, { status: 500 });
  }
}
