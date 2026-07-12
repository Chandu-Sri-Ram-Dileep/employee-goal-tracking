import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    const { managerId,status } =
      body;

    const manager =
     await prisma.manager.update({
  where: {
    id: managerId,
  },
  data: {
    status,
  },
});
    return NextResponse.json({
      message:
        "Manager status updated",

      manager,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update manager status",
      },
      {
        status: 500,
      }
    );
  }
}