"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";

export default function AdminSettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [auditLogging, setAuditLogging] = useState(true);
  const [strictRbac, setStrictRbac] = useState(true);
  const [requireCheckinReview, setRequireCheckinReview] = useState(true);

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
          Admin System Settings
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Configure security, system audit policies, and administrative account controls.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Admin Password Change */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "error.light", color: "error.main", display: "flex" }}>
                <LockIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Admin Password & Credentials
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Update root system administrative password
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleChangePassword}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Admin Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Admin Password"
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
                    color="error"
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

        {/* Global Security Policy Controls */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "warning.light", color: "warning.main", display: "flex" }}>
                <SecurityIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  System Security Policies
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Global security enforcement parameters
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Detailed Audit Logging
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Log all user actions, logins, and approvals in AuditTrail
                  </Typography>
                </Box>
                <Switch
                  checked={auditLogging}
                  onChange={(e) => setAuditLogging(e.target.checked)}
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Strict Role-Based Access Control
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enforce JWT claims & route boundary checks
                  </Typography>
                </Box>
                <Switch
                  checked={strictRbac}
                  onChange={(e) => setStrictRbac(e.target.checked)}
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Mandatory Manager Check-in Review
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Require manager approval before progress reflects in metrics
                  </Typography>
                </Box>
                <Switch
                  checked={requireCheckinReview}
                  onChange={(e) => setRequireCheckinReview(e.target.checked)}
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
