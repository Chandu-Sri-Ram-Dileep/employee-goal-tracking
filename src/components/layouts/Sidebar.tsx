"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupsIcon from "@mui/icons-material/Groups";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 260;

export const sidebarConfig = {
  EMPLOYEE: [
    { text: "Dashboard", path: "/employee/dashboard", icon: <DashboardIcon /> },
    { text: "My Goals", path: "/employee/goals", icon: <TrackChangesIcon /> },
    { text: "Check-ins", path: "/employee/checkins", icon: <AssignmentTurnedInIcon /> },
    { text: "Performance History", path: "/employee/performance", icon: <AssessmentIcon /> },
    { text: "My Profile", path: "/employee/profile", icon: <PersonIcon /> },
    { text: "Settings", path: "/employee/settings", icon: <SettingsIcon /> },
    { text: "Audit Logs", path: "/employee/audit-logs", icon: <HistoryIcon /> },
  ],

  MANAGER: [
    { text: "Dashboard", path: "/manager/dashboard", icon: <DashboardIcon /> },
    { text: "Employees", path: "/manager/employees", icon: <GroupsIcon /> },
    { text: "Check-ins", path: "/manager/checkins", icon: <AssignmentTurnedInIcon /> },
    { text: "Team Goals", path: "/manager/team-goals", icon: <TrackChangesIcon /> },
    { text: "Shared Goals", path: "/manager/shared-goals", icon: <GroupsIcon /> },
    { text: "Approvals", path: "/manager/approvals", icon: <AssignmentTurnedInIcon /> },
    { text: "Reports", path: "/manager/reports", icon: <AssessmentIcon /> },
    { text: "Audit Logs", path: "/manager/audit-logs", icon: <HistoryIcon /> },
  ],

  ADMIN: [
    { text: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
    { text: "Managers", path: "/admin/managers", icon: <GroupsIcon /> },
    { text: "Employees", path: "/admin/employees", icon: <GroupsIcon /> },
    { text: "Goal Unlock Requests", path: "/admin/unlock-requests", icon: <LockOpenIcon /> },
    { text: "Goal Cycles", path: "/admin/goal-cycles", icon: <TrackChangesIcon /> },
    { text: "Shared Goals", path: "/admin/shared-goals", icon: <GroupsIcon /> },
    { text: "Analytics", path: "/admin/analytics", icon: <AssessmentIcon /> },
    { text: "Audit Logs", path: "/admin/audit-logs", icon: <HistoryIcon /> },
  ],
};

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = sidebarConfig[user.role];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#0b0f19",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.35)",
            letterSpacing: 1.5,
            fontSize: "0.65rem",
          }}
        >
          {user.role} Navigation
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              href={item.path}
              sx={{
                my: 0.4,
                borderRadius: 2,
                px: 2,
                py: 1.2,
                background: isActive
                  ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(99, 102, 241, 0.4)"
                  : "1px solid transparent",
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.12) 100%)"
                    : "rgba(255, 255, 255, 0.04)",
                  color: "#ffffff",
                  transform: "translateX(3px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "#818cf8" : "rgba(255, 255, 255, 0.4)",
                  minWidth: 38,
                  "& svg": { fontSize: 20 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 700 : 500,
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}