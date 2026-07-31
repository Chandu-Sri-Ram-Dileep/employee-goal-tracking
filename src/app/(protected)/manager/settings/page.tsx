"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SaveIcon from "@mui/icons-material/Save";

export default function ManagerSettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [checkinReminders, setCheckinReminders] = useState(true);
  const [goalApprovalsAlert, setGoalApprovalsAlert] = useState(true);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setSnackbar({ open: true, message: "Please fill in all password fields", severity: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "New passwords do not match", severity: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: "Password must be at least 6 characters", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setSnackbar({ open: true, message: "Password updated successfully!", severity: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Password update failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Manager Account Settings
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Manage your account security, notification alerts, and communication preferences.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Password Security */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "warning.light", color: "warning.main", display: "flex" }}>
                <LockIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Security & Password
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Update your authentication credentials securely
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleChangePassword}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="At least 6 characters long"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="warning"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Notifications & Preferences */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "info.light", color: "info.main", display: "flex" }}>
                <NotificationsIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Notification Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Configure direct report activity notifications
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Goal Sheet Approvals
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Notify when employees submit goal sheets for review
                  </Typography>
                </Box>
                <Switch
                  checked={goalApprovalsAlert}
                  onChange={(e) => setGoalApprovalsAlert(e.target.checked)}
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Check-in Review Requests
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Alert when check-ins require manager evaluation
                  </Typography>
                </Box>
                <Switch
                  checked={checkinReminders}
                  onChange={(e) => setCheckinReminders(e.target.checked)}
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Email Notifications Digest
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive weekly team progress summaries via email
                  </Typography>
                </Box>
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
