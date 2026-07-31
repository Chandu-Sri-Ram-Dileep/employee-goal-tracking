import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        profile: {
          include: {
            educations: true,
            projects: true,
            certifications: true,
            responsibilities: true,
          },
        },
        employees: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager profile not found" }, { status: 404 });
    }

    return NextResponse.json(manager);
  } catch (error: any) {
    console.error("GET manager profile error:", error);
    return NextResponse.json({ message: "Failed to fetch manager profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const manager = await prisma.manager.findUnique({
      where: { userId: user.id },
      include: { profile: true },
    });

    if (!manager) {
      return NextResponse.json({ message: "Manager profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, address, profilePhoto, summary, totalExperience, educations, projects, certifications } = body;

    // Update user info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : user.profilePhoto,
      },
    });

    // Update manager fields
    await prisma.manager.update({
      where: { id: manager.id },
      data: {
        phone: phone !== undefined ? phone : manager.phone,
        address: address !== undefined ? address : manager.address,
      },
    });

    // Upsert ManagerProfile
    let profile = manager.profile;
    if (!profile) {
      profile = await prisma.managerProfile.create({
        data: {
          managerId: manager.id,
          summary: summary || "",
          totalExperience: totalExperience ? parseFloat(totalExperience) : 0,
        },
      });
    } else {
      profile = await prisma.managerProfile.update({
        where: { id: profile.id },
        data: {
          summary: summary !== undefined ? summary : profile.summary,
          totalExperience: totalExperience !== undefined ? parseFloat(totalExperience) : profile.totalExperience,
        },
      });
    }

    // Handle nested collections if provided
    if (educations && Array.isArray(educations)) {
      await prisma.managerEducation.deleteMany({ where: { profileId: profile.id } });
      if (educations.length > 0) {
        await prisma.managerEducation.createMany({
          data: educations.map((e: any) => ({
            profileId: profile.id,
            qualification: e.qualification,
            institution: e.institution,
            specialization: e.specialization || null,
            score: e.score || null,
            startYear: e.startYear ? parseInt(e.startYear) : null,
            endYear: e.endYear ? parseInt(e.endYear) : null,
          })),
        });
      }
    }

    if (projects && Array.isArray(projects)) {
      await prisma.managerProject.deleteMany({ where: { profileId: profile.id } });
      if (projects.length > 0) {
        await prisma.managerProject.createMany({
          data: projects.map((p: any) => ({
            profileId: profile.id,
            title: p.title,
            description: p.description,
            technologies: p.technologies,
            githubUrl: p.githubUrl || null,
            liveUrl: p.liveUrl || null,
          })),
        });
      }
    }

    if (certifications && Array.isArray(certifications)) {
      await prisma.managerCertification.deleteMany({ where: { profileId: profile.id } });
      if (certifications.length > 0) {
        await prisma.managerCertification.createMany({
          data: certifications.map((c: any) => ({
            profileId: profile.id,
            name: c.name,
            provider: c.provider,
            credentialUrl: c.credentialUrl || null,
          })),
        });
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("POST manager profile error:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
