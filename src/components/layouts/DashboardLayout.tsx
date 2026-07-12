"use client";
import { Box, Toolbar } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
interface DashboardLayoutProps {
  children: React.ReactNode;

  user: {
    id: string;

    name: string;

    email: string;

    role:
      | "ADMIN"
      | "MANAGER"
      | "EMPLOYEE";
  };
}
export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} />
      <Sidebar user={user} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}