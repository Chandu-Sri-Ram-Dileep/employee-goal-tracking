"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import SaveIcon from "@mui/icons-material/Save";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BadgeIcon from "@mui/icons-material/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Education {
  id?: string;
  qualification: string;
  institution: string;
  specialization?: string;
  score?: string;
  startYear?: number | string;
  endYear?: number | string;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
}

interface Certification {
  id?: string;
  name: string;
  provider: string;
  issueDate?: string;
  credentialUrl?: string;
}

interface Responsibility {
  id?: string;
  title: string;
  organization: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface EmployeeProfile {
  id: string;
  employeeCode: string;
  department: string;
  designation: string;
  gender: string;
  phone?: string;
  address?: string;
  status: string;
  user: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
  profile?: {
    summary?: string;
    totalExperience?: number;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    educations: Education[];
    projects: Project[];
    certifications: Certification[];
    responsibilities: Responsibility[];
  };
}

// ─── Tab Panel Component ──────────────────────────────────────────────────────

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "primary.main",
        color: "white",
        textAlign: "center",
        minWidth: 100,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeProfilePage() {
  const [data, setData] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Editable fields state
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [totalExperience, setTotalExperience] = useState<string>("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);

  // Dialog states
  const [eduDialog, setEduDialog] = useState(false);
  const [projDialog, setProjDialog] = useState(false);
  const [certDialog, setCertDialog] = useState(false);
  const [respDialog, setRespDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // New item forms
  const [newEdu, setNewEdu] = useState<Education>({ qualification: "", institution: "" });
  const [newProj, setNewProj] = useState<Project>({ title: "", description: "", technologies: "" });
  const [newCert, setNewCert] = useState<Certification>({ name: "", provider: "" });
  const [newResp, setNewResp] = useState<Responsibility>({ title: "", organization: "" });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employee/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const emp: EmployeeProfile = await res.json();
      setData(emp);
      // Populate editable fields
      setName(emp.user.name || "");
      setGender(emp.gender || "");
      setPhone(emp.phone || "");
      setAddress(emp.address || "");
      setProfilePhoto(emp.user.profilePhoto || "");
      setSummary(emp.profile?.summary || "");
      setTotalExperience(emp.profile?.totalExperience?.toString() || "");
      setLinkedinUrl(emp.profile?.linkedinUrl || "");
      setGithubUrl(emp.profile?.githubUrl || "");
      setPortfolioUrl(emp.profile?.portfolioUrl || "");
      setEducations(emp.profile?.educations || []);
      setProjects(emp.profile?.projects || []);
      setCertifications(emp.profile?.certifications || []);
      setResponsibilities(emp.profile?.responsibilities || []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load profile", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          phone,
          address,
          summary,
          totalExperience: totalExperience ? parseFloat(totalExperience) : null,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          educations,
          projects,
          certifications,
          responsibilities,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save");
      // Update photo if changed
      if (profilePhoto !== data?.user.profilePhoto) {
        await fetch("/api/employee/profile/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhoto }),
        });
      }
      setData(result);
      setSnackbar({ open: true, message: "Profile saved successfully!", severity: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Education Handlers ──
  const openAddEdu = () => { setEditIndex(null); setNewEdu({ qualification: "", institution: "" }); setEduDialog(true); };
  const openEditEdu = (i: number) => { setEditIndex(i); setNewEdu({ ...educations[i] }); setEduDialog(true); };
  const saveEdu = () => {
    if (editIndex !== null) {
      const updated = [...educations]; updated[editIndex] = newEdu; setEducations(updated);
    } else {
      setEducations([...educations, newEdu]);
    }
    setEduDialog(false);
  };
  const deleteEdu = (i: number) => setEducations(educations.filter((_, idx) => idx !== i));

  // ── Project Handlers ──
  const openAddProj = () => { setEditIndex(null); setNewProj({ title: "", description: "", technologies: "" }); setProjDialog(true); };
  const openEditProj = (i: number) => { setEditIndex(i); setNewProj({ ...projects[i] }); setProjDialog(true); };
  const saveProj = () => {
    if (editIndex !== null) {
      const updated = [...projects]; updated[editIndex] = newProj; setProjects(updated);
    } else {
      setProjects([...projects, newProj]);
    }
    setProjDialog(false);
  };
  const deleteProj = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));

  // ── Certification Handlers ──
  const openAddCert = () => { setEditIndex(null); setNewCert({ name: "", provider: "" }); setCertDialog(true); };
  const openEditCert = (i: number) => { setEditIndex(i); setNewCert({ ...certifications[i] }); setCertDialog(true); };
  const saveCert = () => {
    if (editIndex !== null) {
      const updated = [...certifications]; updated[editIndex] = newCert; setCertifications(updated);
    } else {
      setCertifications([...certifications, newCert]);
    }
    setCertDialog(false);
  };
  const deleteCert = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));

  // ── Responsibility Handlers ──
  const openAddResp = () => { setEditIndex(null); setNewResp({ title: "", organization: "" }); setRespDialog(true); };
  const openEditResp = (i: number) => { setEditIndex(i); setNewResp({ ...responsibilities[i] }); setRespDialog(true); };
  const saveResp = () => {
    if (editIndex !== null) {
      const updated = [...responsibilities]; updated[editIndex] = newResp; setResponsibilities(updated);
    } else {
      setResponsibilities([...responsibilities, newResp]);
    }
    setRespDialog(false);
  };
  const deleteResp = (i: number) => setResponsibilities(responsibilities.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading your profile…</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load profile. Please refresh the page.
      </Alert>
    );
  }

  const initials = data.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* ── Header Banner ────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -60,
            right: 60,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Avatar
            src={data.user.profilePhoto || undefined}
            sx={{
              width: 90,
              height: 90,
              fontSize: 32,
              fontWeight: 700,
              bgcolor: "rgba(255,255,255,0.2)",
              border: "3px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {data.user.name}
            </Typography>
            <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
              {data.designation} · {data.department}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
              {data.user.email}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Chip
                label={data.status}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, fontSize: "0.7rem" }}
              />
              <Chip
                label={`ID: ${data.employeeCode}`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.7rem" }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <StatCard label="Experience" value={`${data.profile?.totalExperience ?? "—"} yr`} />
            <StatCard label="Education" value={educations.length} />
            <StatCard label="Projects" value={projects.length} />
            <StatCard label="Certs" value={certifications.length} />
          </Box>
        </Box>
      </Paper>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": { minHeight: 60, gap: 1, fontWeight: 500 },
            "& .Mui-selected": { fontWeight: 700 },
          }}
        >
          <Tab icon={<PersonIcon />} label="Personal" iconPosition="start" />
          <Tab icon={<WorkIcon />} label="Professional" iconPosition="start" />
          <Tab icon={<SchoolIcon />} label="Education" iconPosition="start" />
          <Tab icon={<CodeIcon />} label="Projects" iconPosition="start" />
          <Tab icon={<EmojiEventsIcon />} label="Certifications & Roles" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* ── Tab 0: Personal Info ─────────────────────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Profile Avatar Photo URL"
                  fullWidth
                  placeholder="https://images.unsplash.com/photo-..."
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  helperText="Paste direct image URL to update your avatar icon across GoalTrack"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Email Address"
                  fullWidth
                  value={data.user.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Employee Code"
                  fullWidth
                  value={data.employeeCode}
                  disabled
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Department"
                  fullWidth
                  value={data.department}
                  disabled
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessCenterIcon color="action" /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Designation"
                  fullWidth
                  value={data.designation}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Status"
                  fullWidth
                  value={data.status}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your residential address"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── Tab 1: Professional Profile ──────────────────────────────────── */}
          <TabPanel value={tab} index={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Professional Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Professional Summary"
                  fullWidth
                  multiline
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief professional summary highlighting your skills, experience, and expertise…"
                  helperText={`${summary.length} characters`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Years of Experience"
                  fullWidth
                  type="number"
                  value={totalExperience}
                  onChange={(e) => setTotalExperience(e.target.value)}
                  slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
                  helperText="Total professional experience in years"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="LinkedIn Profile URL"
                  fullWidth
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-name"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ color: "#0A66C2" }} /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="GitHub Profile URL"
                  fullWidth
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><GitHubIcon /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Portfolio / Website URL"
                  fullWidth
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LanguageIcon color="action" /></InputAdornment> } }}
                />
              </Grid>
            </Grid>
            {/* Social Links Preview */}
            {(linkedinUrl || githubUrl || portfolioUrl) && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Quick Links
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {linkedinUrl && (
                    <Button size="small" variant="outlined" startIcon={<LinkedInIcon />} href={linkedinUrl} target="_blank" sx={{ color: "#0A66C2", borderColor: "#0A66C2" }}>
                      LinkedIn
                    </Button>
                  )}
                  {githubUrl && (
                    <Button size="small" variant="outlined" startIcon={<GitHubIcon />} href={githubUrl} target="_blank">
                      GitHub
                    </Button>
                  )}
                  {portfolioUrl && (
                    <Button size="small" variant="outlined" startIcon={<LanguageIcon />} href={portfolioUrl} target="_blank" color="secondary">
                      Portfolio
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </TabPanel>

          {/* ── Tab 2: Education ─────────────────────────────────────────────── */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Education History
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAddEdu}>
                Add Education
              </Button>
            </Box>
            {educations.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderStyle: "dashed", borderRadius: 2 }}>
                <SchoolIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">No education records yet. Click "Add Education" to get started.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {educations.map((edu, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", "&:hover": { borderColor: "primary.main", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }, transition: "all 0.2s" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {edu.qualification}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                          {edu.institution}
                          {edu.specialization && ` · ${edu.specialization}`}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                          {edu.startYear && <Chip label={`${edu.startYear}${edu.endYear ? ` – ${edu.endYear}` : " – Present"}`} size="small" />}
                          {edu.score && <Chip label={`Score: ${edu.score}`} size="small" variant="outlined" />}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openEditEdu(i)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteEdu(i)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>

          {/* ── Tab 3: Projects ──────────────────────────────────────────────── */}
          <TabPanel value={tab} index={3}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Projects
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAddProj}>
                Add Project
              </Button>
            </Box>
            {projects.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderStyle: "dashed", borderRadius: 2 }}>
                <CodeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">No projects added yet. Showcase your work!</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {projects.map((proj, i) => (
                  <Grid size={{ xs: 12, md: 6 }} key={i}>
                    <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 2, border: "1px solid", borderColor: "divider", "&:hover": { borderColor: "primary.main", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }, transition: "all 0.2s" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {proj.title}
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={() => openEditProj(i)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteProj(i)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {proj.description}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
                        {proj.technologies.split(",").map((t, ti) => (
                          <Chip key={ti} label={t.trim()} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                        ))}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {proj.githubUrl && (
                          <Button size="small" startIcon={<GitHubIcon />} href={proj.githubUrl} target="_blank" variant="text">
                            GitHub
                          </Button>
                        )}
                        {proj.liveUrl && (
                          <Button size="small" startIcon={<LanguageIcon />} href={proj.liveUrl} target="_blank" variant="text" color="secondary">
                            Live
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* ── Tab 4: Certifications & Responsibilities ──────────────────────── */}
          <TabPanel value={tab} index={4}>
            {/* Certifications */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Certifications
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAddCert}>
                Add Certification
              </Button>
            </Box>
            {certifications.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderStyle: "dashed", borderRadius: 2, mb: 4 }}>
                <Typography color="text.secondary">No certifications added yet.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
                {certifications.map((cert, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{cert.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{cert.provider}</Typography>
                      {cert.issueDate && (
                        <Typography variant="caption" color="text.secondary">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {cert.credentialUrl && (
                        <Button size="small" href={cert.credentialUrl} target="_blank" variant="outlined">
                          View
                        </Button>
                      )}
                      <IconButton size="small" onClick={() => openEditCert(i)} color="primary"><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => deleteCert(i)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Positions of Responsibility */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Positions of Responsibility
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAddResp}>
                Add Position
              </Button>
            </Box>
            {responsibilities.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderStyle: "dashed", borderRadius: 2 }}>
                <Typography color="text.secondary">No positions of responsibility added yet.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {responsibilities.map((resp, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{resp.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{resp.organization}</Typography>
                        {resp.description && <Typography variant="body2" sx={{ mt: 0.5 }}>{resp.description}</Typography>}
                        {(resp.startDate || resp.endDate) && (
                          <Typography variant="caption" color="text.secondary">
                            {resp.startDate ? new Date(resp.startDate).toLocaleDateString() : "—"} — {resp.endDate ? new Date(resp.endDate).toLocaleDateString() : "Present"}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => openEditResp(i)} color="primary"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => deleteResp(i)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* ── Save Button ───────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ px: 4, py: 1.5, borderRadius: 2, boxShadow: "0 4px 14px rgba(25,118,210,0.4)" }}
        >
          {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </Box>

      {saving && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}

      {/* Education Dialog */}
      <Dialog open={eduDialog} onClose={() => setEduDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Education" : "Add Education"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Qualification / Degree *" fullWidth value={newEdu.qualification} onChange={(e) => setNewEdu({ ...newEdu, qualification: e.target.value })} placeholder="e.g. B.Tech in Computer Science" />
            <TextField label="Institution *" fullWidth value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="e.g. IIT Bombay" />
            <TextField label="Specialization" fullWidth value={newEdu.specialization || ""} onChange={(e) => setNewEdu({ ...newEdu, specialization: e.target.value })} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Start Year" fullWidth type="number" value={newEdu.startYear || ""} onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="End Year" fullWidth type="number" value={newEdu.endYear || ""} onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })} placeholder="Leave blank if ongoing" />
              </Grid>
            </Grid>
            <TextField label="Score / GPA / Percentage" fullWidth value={newEdu.score || ""} onChange={(e) => setNewEdu({ ...newEdu, score: e.target.value })} placeholder="e.g. 8.5 CGPA or 85%" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEduDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdu} disabled={!newEdu.qualification || !newEdu.institution}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={projDialog} onClose={() => setProjDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Project Title *" fullWidth value={newProj.title} onChange={(e) => setNewProj({ ...newProj, title: e.target.value })} />
            <TextField label="Description *" fullWidth multiline rows={3} value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} />
            <TextField label="Technologies (comma separated) *" fullWidth value={newProj.technologies} onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
            <TextField label="GitHub URL" fullWidth value={newProj.githubUrl || ""} onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })} />
            <TextField label="Live URL" fullWidth value={newProj.liveUrl || ""} onChange={(e) => setNewProj({ ...newProj, liveUrl: e.target.value })} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Start Date" fullWidth type="date" value={newProj.startDate || ""} onChange={(e) => setNewProj({ ...newProj, startDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="End Date" fullWidth type="date" value={newProj.endDate || ""} onChange={(e) => setNewProj({ ...newProj, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveProj} disabled={!newProj.title || !newProj.description || !newProj.technologies}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={certDialog} onClose={() => setCertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Certification" : "Add Certification"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Certification Name *" fullWidth value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" />
            <TextField label="Provider / Issuing Organization *" fullWidth value={newCert.provider} onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })} placeholder="e.g. Amazon Web Services" />
            <TextField label="Issue Date" fullWidth type="date" value={newCert.issueDate || ""} onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Credential URL" fullWidth value={newCert.credentialUrl || ""} onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })} placeholder="https://verify.credential.url" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCert} disabled={!newCert.name || !newCert.provider}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Responsibility Dialog */}
      <Dialog open={respDialog} onClose={() => setRespDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Position" : "Add Position of Responsibility"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Position / Title *" fullWidth value={newResp.title} onChange={(e) => setNewResp({ ...newResp, title: e.target.value })} placeholder="e.g. Student Council President" />
            <TextField label="Organization *" fullWidth value={newResp.organization} onChange={(e) => setNewResp({ ...newResp, organization: e.target.value })} placeholder="e.g. IIT Bombay" />
            <TextField label="Description" fullWidth multiline rows={2} value={newResp.description || ""} onChange={(e) => setNewResp({ ...newResp, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Start Date" fullWidth type="date" value={newResp.startDate || ""} onChange={(e) => setNewResp({ ...newResp, startDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="End Date" fullWidth type="date" value={newResp.endDate || ""} onChange={(e) => setNewResp({ ...newResp, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRespDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveResp} disabled={!newResp.title || !newResp.organization}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
