import { prisma } from "@/lib/prisma";

export async function generateEmployeeCode() {
  const count =
    await prisma.employee.count();

  return `EMP${String(
    count + 1
  ).padStart(3, "0")}`;
}