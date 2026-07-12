import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const adminExists =
      await prisma.user.findFirst({
        where: {
          role: "ADMIN",
        },
      });

    if (adminExists) {
      return NextResponse.json({
        success: true,
        message:
          "Admin already exists",
      });
    }

    await prisma.user.create({
      data: {
        name: "System Administrator",

        email:
          "admin@goaltracking.com",

        password:
          await hashPassword(
            "Admin@123"
          ),

        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "System Admin created successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to seed admin",
      },
      {
        status: 500,
      }
    );
  }
}