import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Gender } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        profile: {
          include: {
            educations: {
              orderBy: { createdAt: "asc" },
            },
            projects: {
              orderBy: { createdAt: "asc" },
            },
            certifications: {
              orderBy: { createdAt: "asc" },
            },
            responsibilities: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
      include: {
        profile: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      gender,
      phone,
      address,
      summary,
      totalExperience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      educations = [],
      projects = [],
      certifications = [],
      responsibilities = [],
    } = body;

    // Validate Gender
    if (gender && !Object.values(Gender).includes(gender as Gender)) {
      return NextResponse.json(
        { message: "Invalid gender value" },
        { status: 400 }
      );
    }

    // Run all updates in a database transaction
    const updatedEmployee = await prisma.$transaction(async (tx) => {
      // 1. Update User name if provided
      if (name) {
        await tx.user.update({
          where: { id: user.id },
          data: { name },
        });
      }

      // 2. Update Employee fields
      await tx.employee.update({
        where: { id: employee.id },
        data: {
          gender: gender as Gender,
          phone: phone || null,
          address: address || null,
        },
      });

      // 3. Upsert EmployeeProfile
      const profile = await tx.employeeProfile.upsert({
        where: { employeeId: employee.id },
        update: {
          summary: summary || null,
          totalExperience: totalExperience !== undefined ? parseFloat(totalExperience) : null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
        },
        create: {
          employeeId: employee.id,
          summary: summary || null,
          totalExperience: totalExperience !== undefined ? parseFloat(totalExperience) : null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
        },
      });

      // 4. Reset and Recreate Educations
      await tx.education.deleteMany({
        where: { profileId: profile.id },
      });
      if (educations.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any) => ({
            profileId: profile.id,
            qualification: edu.qualification,
            institution: edu.institution,
            specialization: edu.specialization || null,
            score: edu.score || null,
            startYear: edu.startYear ? parseInt(edu.startYear) : null,
            endYear: edu.endYear ? parseInt(edu.endYear) : null,
          })),
        });
      }

      // 5. Reset and Recreate Projects
      await tx.employeeProject.deleteMany({
        where: { profileId: profile.id },
      });
      if (projects.length > 0) {
        await tx.employeeProject.createMany({
          data: projects.map((proj: any) => ({
            profileId: profile.id,
            title: proj.title,
            description: proj.description,
            technologies: proj.technologies,
            githubUrl: proj.githubUrl || null,
            liveUrl: proj.liveUrl || null,
            startDate: proj.startDate ? new Date(proj.startDate) : null,
            endDate: proj.endDate ? new Date(proj.endDate) : null,
          })),
        });
      }

      // 6. Reset and Recreate Certifications
      await tx.certification.deleteMany({
        where: { profileId: profile.id },
      });
      if (certifications.length > 0) {
        await tx.certification.createMany({
          data: certifications.map((cert: any) => ({
            profileId: profile.id,
            name: cert.name,
            provider: cert.provider,
            issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
            credentialUrl: cert.credentialUrl || null,
          })),
        });
      }

      // 7. Reset and Recreate Responsibilities
      await tx.positionOfResponsibility.deleteMany({
        where: { profileId: profile.id },
      });
      if (responsibilities.length > 0) {
        await tx.positionOfResponsibility.createMany({
          data: responsibilities.map((resp: any) => ({
            profileId: profile.id,
            title: resp.title,
            organization: resp.organization,
            description: resp.description || null,
            startDate: resp.startDate ? new Date(resp.startDate) : null,
            endDate: resp.endDate ? new Date(resp.endDate) : null,
          })),
        });
      }

      // 8. Log the update in AuditLog
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PROFILE_UPDATED",
          entityType: "EMPLOYEE_PROFILE",
          entityId: profile.id,
          remarks: "Employee updated their profile details",
        },
      });

      // Return refreshed profile info
      return tx.employee.findUnique({
        where: { id: employee.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
          profile: {
            include: {
              educations: { orderBy: { createdAt: "asc" } },
              projects: { orderBy: { createdAt: "asc" } },
              certifications: { orderBy: { createdAt: "asc" } },
              responsibilities: { orderBy: { createdAt: "asc" } },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
