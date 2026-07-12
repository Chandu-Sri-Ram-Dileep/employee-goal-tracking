// "use client";
// import {
//   FormControl,
//   MenuItem,
//   Select,
// } from "@mui/material";
// import {
//   useAuthStore,
// } from "@/store/authStore";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Box,
//   Avatar,
// } from "@mui/material";

// export default function Navbar() {
//   const user =
//   useAuthStore(
//     (state) => state.user
//   );

// const role =
//   user?.role ?? "EMPLOYEE";
//   return (
//     <AppBar
//       position="fixed"
//       elevation={1}
//       color="inherit"
//     >
//       <Toolbar>
//         <Typography
//           variant="h6"
//           sx={{
//             flexGrow: 1,
//             fontWeight: 600,
//           }}
//         >
//           Goal Management Portal
//         </Typography>
//         <Box
//   sx={{
//     display: "flex",
//     alignItems: "center",
//     gap: 2,
//   }}
// >
//          <Typography
//   sx={{
//     fontWeight: 600,
//   }}
// >
//   {role}
// </Typography>
//           <Avatar>S</Avatar>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }
"use client";

import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

interface NavbarProps {
  user: User;
}

export default function Navbar({
  user,
}: NavbarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      color="inherit"
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          Goal Management Portal
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            {user.role}
          </Typography>

          <Typography
            color="text.secondary"
          >
            {user.name}
          </Typography>

          <Avatar>
            {user.name.charAt(0)}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}