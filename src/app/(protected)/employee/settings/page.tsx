"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import ShieldIcon from "@mui/icons-material/Shield";
import SaveIcon from "@mui/icons-material/Save";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [checkinReminders, setCheckinReminders] = useState(true);
  const [cycleUpdates, setCycleUpdates] = useState(true);

  // Display toggles
  const [compactView, setCompactView] = useState(false);
  const [highContrast, setHighContrast] = useState(true);

  const [toast, setToast] = useState({ open: false, message: "" });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("Please fill out all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.message || "Failed to update password.");
        return;
      }

      setPassSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ open: true, message: "Password updated successfully in database!" });
    } catch (err: any) {
      setPassError(err.message || "An error occurred.");
    }
  };

  const handleSavePreferences = () => {
    setToast({ open: true, message: "System preferences saved!" });
  };

  return (
    <Box sx={{ color: "#fff", maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex" }}>
          <SettingsIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Account & System Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Manage security credentials, notification channels, and platform display options.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Security Credentials */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, height: "100%", background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LockIcon sx={{ color: "#6366f1" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Security & Password
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", mb: 3, display: "block" }}>
              Update your secret credentials. Choose a strong, unique password.
            </Typography>

            {passError && <Alert severity="error" sx={{ mb: 2 }}>{passError}</Alert>}
            {passSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password updated successfully.</Alert>}

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  size="small"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { color: "#fff" } }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  size="small"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { color: "#fff" } }}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { color: "#fff" } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#4f46e5" },
                    mt: 1,
                    py: 1,
                    fontWeight: 700,
                  }}
                >
                  Update Security Password
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShieldIcon sx={{ color: "#10b981", fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                Session encrypted with standard JWT authentication token.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Notifications & Display */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Notification Preferences */}
            <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <NotificationsIcon sx={{ color: "#f59e0b" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Notification Preferences
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      Email Notifications
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      Receive goal sheet approval status updates via email.
                    </Typography>
                  </Box>
                  <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} color="primary" />
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      Check-in Reminders
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      Alerts when quarterly check-in windows open.
                    </Typography>
                  </Box>
                  <Switch checked={checkinReminders} onChange={(e) => setCheckinReminders(e.target.checked)} color="primary" />
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      Goal Cycle Announcements
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      Broadcasting cycle activation and freeze deadlines.
                    </Typography>
                  </Box>
                  <Switch checked={cycleUpdates} onChange={(e) => setCycleUpdates(e.target.checked)} color="primary" />
                </Box>
              </Stack>
            </Paper>

            {/* Display Preferences */}
            <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <DisplaySettingsIcon sx={{ color: "#10b981" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Display & Interface
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      Industrial Dark Mode
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      High-contrast carbon theme.
                    </Typography>
                  </Box>
                  <Chip label="Active" size="small" sx={{ bgcolor: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }} />
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      Compact Density
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      Show more data rows in tables and goal cards.
                    </Typography>
                  </Box>
                  <Switch checked={compactView} onChange={(e) => setCompactView(e.target.checked)} color="primary" />
                </Box>
              </Stack>

              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Button
                  variant="outlined"
                  onClick={handleSavePreferences}
                  sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", "&:hover": { borderColor: "#6366f1" } }}
                >
                  Save Preferences
                </Button>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
      />
    </Box>
  );
}