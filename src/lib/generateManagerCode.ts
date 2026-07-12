import { prisma } from "@/lib/prisma";

export async function generateManagerCode() {
  const count =
    await prisma.manager.count();

  return `MNG${String(
    count + 1
  ).padStart(3, "0")}`;
}