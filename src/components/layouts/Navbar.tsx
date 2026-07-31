"use client";

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";
import NotificationCenter from "@/components/common/NotificationCenter";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

interface NavbarProps {
  user: User;
}

const roleBadgeColor = (role: string) => {
  if (role === "ADMIN") return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
  if (role === "MANAGER") return { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
  return { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" };
};

export default function Navbar({ user }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const roleStyle = roleBadgeColor(user.role);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "rgba(17, 24, 39, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              display: "flex",
              boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
            }}
          >
            <PrecisionManufacturingIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                background: "linear-gradient(90deg, #f3f4f6 0%, #9ca3af 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              GOALTRACK
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "0.62rem",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Industrial PMS Engine
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor: roleStyle.bg,
              color: roleStyle.text,
              border: `1px solid ${roleStyle.border}`,
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: 1,
            }}
          />

          <NotificationCenter />

          <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#f3f4f6", lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.7rem" }}>
              {user.email}
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              p: 0.5,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#6366f1",
                boxShadow: "0 0 12px rgba(99, 102, 241, 0.3)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.85rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
                color: "#fff",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: "#111827",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  minWidth: 200,
                  mt: 1,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                window.location.href = `/${user.role.toLowerCase()}/profile`;
              }}
              sx={{ gap: 1.5, fontSize: "0.85rem", py: 1 }}
            >
              <PersonIcon sx={{ fontSize: 18, color: "#6366f1" }} />
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                window.location.href = `/${user.role.toLowerCase()}/settings`;
              }}
              sx={{ gap: 1.5, fontSize: "0.85rem", py: 1 }}
            >
              <SettingsIcon sx={{ fontSize: 18, color: "#10b981" }} />
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                window.location.href = "/terms";
              }}
              sx={{ gap: 1.5, fontSize: "0.85rem", py: 1 }}
            >
              <ShieldIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
              Terms &amp; Privacy
            </MenuItem>
            <MenuItem
              onClick={async () => {
                handleMenuClose();
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch (e) {
                  console.error(e);
                }
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.replace("/login");
              }}
              sx={{ gap: 1.5, fontSize: "0.85rem", py: 1, color: "#ef4444" }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}