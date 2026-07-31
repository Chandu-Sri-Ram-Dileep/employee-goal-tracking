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

    const { id: managerId } = params;

    const manager = await prisma.manager.findUnique({
      where: { id: managerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePhoto: true,
            createdAt: true,
          },
        },
        profile: {
          include: {
            educations: true,
            projects: true,
            certifications: true,
          },
        },
        employees: {
          include: {
            user: { select: { name: true, email: true } },
            goalSheets: {
              include: {
                goals: {
                  include: {
                    checkins: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager not found" }, { status: 404 });
    }

    // Format employees list with their progress
    const employeesList = manager.employees.map((emp) => {
      const activeSheet = emp.goalSheets[0];
      let progress = 0;
      let goalsCount = 0;
      if (activeSheet && activeSheet.goals.length > 0) {
        goalsCount = activeSheet.goals.length;
        progress = Math.round(
          activeSheet.goals.reduce((acc, g) => acc + (g.progress * g.weightage) / 100, 0)
        );
      }
      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.user.name,
        email: emp.user.email,
        department: emp.department,
        designation: emp.designation,
        status: emp.status,
        goalsCount,
        overallProgress: progress,
      };
    });

    // Gather all team goals executed under this manager
    const teamGoals = manager.employees.flatMap((emp) =>
      emp.goalSheets.flatMap((sheet) =>
        sheet.goals.map((g) => ({
          id: g.id,
          employeeName: emp.user.name,
          employeeCode: emp.employeeCode,
          goalTitle: g.title,
          target: g.target,
          achievement: g.achievement,
          progress: g.progress,
          weightage: g.weightage,
          status: g.status,
          sheetStatus: sheet.status,
        }))
      )
    );

    // Gather all check-ins reviewed / received under this manager
    const checkinReviews = manager.employees.flatMap((emp) =>
      emp.goalSheets.flatMap((sheet) =>
        sheet.goals.flatMap((g) =>
          g.checkins.map((c) => ({
            id: c.id,
            employeeName: emp.user.name,
            employeeCode: emp.employeeCode,
            goalTitle: g.title,
            achievement: c.achievement,
            employeeComment: c.employeeComment,
            managerFeedback: c.managerFeedback,
            status: c.status,
            submittedAt: c.submittedAt,
            reviewedAt: c.reviewedAt,
          }))
        )
      )
    );

    checkinReviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const approvedCheckins = checkinReviews.filter((c) => c.status === "APPROVED").length;
    const returnedCheckins = checkinReviews.filter((c) => c.status === "RETURNED").length;
    const pendingCheckins = checkinReviews.filter((c) => c.status === "PENDING").length;

    return NextResponse.json({
      id: manager.id,
      managerCode: manager.managerCode,
      name: manager.user.name,
      email: manager.user.email,
      profilePhoto: manager.user.profilePhoto,
      joinedAt: manager.user.createdAt,
      phone: manager.phone || "Not provided",
      address: manager.address || "Not provided",
      gender: manager.gender,
      department: manager.department,
      status: manager.status,
      profile: manager.profile || {
        summary: null,
        totalExperience: null,
        educations: [],
        projects: [],
        certifications: [],
      },
      stats: {
        totalTeamSize: manager.employees.length,
        totalTeamGoals: teamGoals.length,
        approvedCheckins,
        returnedCheckins,
        pendingCheckins,
      },
      employees: employeesList,
      teamGoals,
      checkinReviews,
    });
  } catch (error: any) {
    console.error("GET manager-detail error:", error);
    return NextResponse.json({ message: "Failed to fetch manager detail" }, { status: 500 });
  }
}
