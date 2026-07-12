"use client";
import Link from "next/link";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useAuthStore } from "@/store/authStore";
const drawerWidth = 260;
import DashboardIcon from "@mui/icons-material/Dashboard";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupsIcon from "@mui/icons-material/Groups";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LockOpenIcon from "@mui/icons-material/LockOpen" ;
import HistoryIcon from "@mui/icons-material/History";
export const sidebarConfig = {
  EMPLOYEE: [
    {
      text: "Dashboard",
      path: "/employee/dashboard",
      icon: <DashboardIcon />,
    },
    {
      text: "My Goals",
      path: "/employee/goals",
      icon: <TrackChangesIcon />,
    },
    {
      text: "Check-ins",
      path: "/employee/checkins",
      icon: <AssignmentTurnedInIcon />,
    },
    {
      text: "Performance History",
      path: "/employee/performance",
      icon: <AssessmentIcon />,
    },
    {
      text: "My Profile",
      path: "/employee/profile",
      icon: <PersonIcon />,
    },
    {
  text: "Audit Logs",
  path: "/employee/audit-logs",
  icon: <HistoryIcon />,
}
  ],

  MANAGER: [
    {
      text: "Dashboard",
      path: "/manager/dashboard",
      icon: <DashboardIcon />,
    },
     {
      text: "Employees",
      path: "/manager/employees",
      icon: <GroupsIcon />,
    },
    {
      text: "Check-ins",
      path: "/manager/checkins",
      icon: <AssignmentTurnedInIcon />,
    },
    {
      text: "Team Goals",
      path: "/manager/team-goals",
      icon: <GroupsIcon />,
    },
    {
  text: "Shared Goals",
  path: "/manager/shared-goals",
  icon: <GroupsIcon />,
},
    {
      text: "Approvals",
      path: "/manager/approvals",
      icon: <AssignmentTurnedInIcon />,
    },
    {
      text: "Reports",
      path: "/manager/reports",
      icon: <AssessmentIcon />,
    },
    {
  text: "Audit Logs",
  path: "/manager/audit-logs",
  icon: <HistoryIcon />,
}
  ],

  ADMIN: [
    {
      text: "Dashboard",
      path: "/admin/dashboard",
      icon: <DashboardIcon />,
    },
    {
      text: "Managers",
      path: "/admin/managers",
      icon: <GroupsIcon />,
    },
    {
      text: "Employees",
      path: "/admin/employees",
      icon: <GroupsIcon />,
    },
    {
  text: "Goal Unlock Requests",
  path: "/admin/unlock-requests",
  icon: <LockOpenIcon />,
    },
    {
      text: "Goal Cycles",
      path: "/admin/goal-cycles",
      icon: <TrackChangesIcon />,
    },
    {
  text: "Shared Goals",
  path: "/admin/shared-goals",
  icon: <GroupsIcon />,
},
    {
      text: "Analytics",
      path: "/admin/analytics",
      icon: <AssessmentIcon />,
    },
    {
  text: "Audit Logs",
  path: "/admin/audit-logs",
  icon: <HistoryIcon />,
}

  ],
};
// export default function Sidebar(){
// const user =
//   useAuthStore(
//     (state) => state.user
//   );

// const role =
//   user?.role;
// if (!role) {
//   return null;
// }
// const menuItems =sidebarConfig[role];

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         "& .MuiDrawer-paper": {
//           width: drawerWidth,
//           boxSizing: "border-box",
//         },
//       }}
//     >
//       <Toolbar />
//       <List>
//         {menuItems.map((item) => (
//           <ListItemButton
//             key={item.text}
//             component={Link}
//             href={item.path}
//           >
//             <ListItemIcon>
//               {item.icon}
//             </ListItemIcon>

//             <ListItemText
//               primary={item.text}
//             />
//           </ListItemButton>
//         ))}
//       </List>
//     </Drawer>
//   );
// }
interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

interface SidebarProps {
  user: User;
}

export default function Sidebar({
  user,
}: SidebarProps) {
  const menuItems =
    sidebarConfig[user.role];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,

        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,

          boxSizing:
            "border-box",
        },
      }}
    >
      <Toolbar />

      <List>
        {menuItems.map(
          (item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              href={item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={
                  item.text
                }
              />
            </ListItemButton>
          )
        )}
      </List>
    </Drawer>
  );
}