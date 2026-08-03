import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/getCurrentUser";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      user={user}
    >
      {children}
    </DashboardLayout>
  );
}