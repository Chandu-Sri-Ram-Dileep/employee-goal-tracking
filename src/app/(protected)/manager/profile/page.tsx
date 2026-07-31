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
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SaveIcon from "@mui/icons-material/Save";
import BadgeIcon from "@mui/icons-material/Badge";
import GroupIcon from "@mui/icons-material/Group";

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ManagerProfilePage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [summary, setSummary] = useState("");
  const [totalExperience, setTotalExperience] = useState<number | string>("");
  const [employeesCount, setEmployeesCount] = useState(0);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
        setProfilePhoto(data.user?.profilePhoto || "");
        setManagerCode(data.managerCode || "");
        setDepartment(data.department || "");
        setGender(data.gender || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setEmployeesCount(data.employees?.length || 0);

        if (data.profile) {
          setSummary(data.profile.summary || "");
          setTotalExperience(data.profile.totalExperience || "");
        }
      }
    } catch (e) {
      console.error("Error loading manager profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/manager/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          profilePhoto,
          summary,
          totalExperience: totalExperience ? parseFloat(String(totalExperience)) : 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      setSnackbar({ open: true, message: "Manager profile saved successfully!", severity: "success" });
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
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
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
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                border: "4px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "M"}
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {name}
              </Typography>
              <Chip label="MANAGER" size="small" color="warning" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 1.5 }}>
              {department} Department • Manager Code: <strong>{managerCode}</strong>
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<GroupIcon sx={{ color: "#fff !important" }} />}
                label={`${employeesCount} Direct Reports`}
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 600 }}
              />
              <Chip
                icon={<BadgeIcon sx={{ color: "#fff !important" }} />}
                label={`${totalExperience || 0} Yrs Experience`}
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 600 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Tabs Container */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
        >
          <Tab icon={<PersonIcon />} label="Personal Information" iconPosition="start" />
          <Tab icon={<WorkIcon />} label="Professional Details" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Personal Details
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
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
                  helperText="Managed by System Administrator"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Manager Code"
                  value={managerCode}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={department}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Profile Avatar Photo URL"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="Direct image URL for your profile photo across GoalTrack"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Office Address / Location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Management & Leadership Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Years of Management Experience"
                  value={totalExperience}
                  onChange={(e) => setTotalExperience(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Professional Executive Summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of leadership, team management expertise, strategic focus, and technical domain knowledge..."
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
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
