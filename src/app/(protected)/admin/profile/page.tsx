"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalManagers: 0,
    totalGoalCycles: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
        setProfilePhoto(data.user?.profilePhoto || "");
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profilePhoto }),
      });

      if (!res.ok) throw new Error("Failed to save admin profile");
      setSnackbar({ open: true, message: "Admin profile updated successfully!", severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to update profile", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Top Banner Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #1e293b 100%)",
          color: "#fff",
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Avatar
              src={profilePhoto || undefined}
              sx={{
                width: 100,
                height: 100,
                fontSize: "2.2rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                border: "4px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "A"}
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {name}
              </Typography>
              <Chip label="SYSTEM ADMIN" size="small" color="error" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 1.5 }}>
              {email} • Full System Administrator & Access Control
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<SecurityIcon sx={{ color: "#fff !important" }} />}
                label="Super Admin Level Privileges"
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 600 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* System Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "error.light", color: "error.main" }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "info.light", color: "info.main" }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.totalEmployees}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Employees
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "warning.light", color: "warning.main" }}>
                <SupervisorAccountIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.totalManagers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Managers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "success.light", color: "success.main" }}>
                <TrackChangesIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.totalGoalCycles}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Goal Cycles
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Information Form */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          System Administrator Details
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Administrator Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              disabled
              helperText="Root administrator account email"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Profile Avatar Photo URL"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              helperText="Paste direct image URL for your profile avatar across GoalTrack"
            />
          </Grid>
        </Grid>
      </Paper>

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
