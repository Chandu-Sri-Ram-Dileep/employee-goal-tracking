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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import HistoryIcon from "@mui/icons-material/History";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface EmployeeDetailModalProps {
  employeeId: string | null;
  open: boolean;
  onClose: () => void;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function EmployeeDetailModal({ employeeId, open, onClose }: EmployeeDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open && employeeId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/employee-detail/${employeeId}`);
          if (res.ok) {
            const result = await res.json();
            setData(result);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      setData(null);
      setTab(0);
    }
  }, [open, employeeId]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ p: 0, bgcolor: "#0f172a", color: "#fff" }}>
        {loading || !data ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Loading Employee Profile...</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size="auto">
                <Avatar
                  src={data.profilePhoto || undefined}
                  sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: "1.5rem", fontWeight: 700 }}
                >
                  {data.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
                    {data.name}
                  </Typography>
                  <Chip label={data.status} size="small" color={data.status === "ACTIVE" ? "success" : "default"} sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
                  {data.employeeCode} • {data.designation} ({data.department})
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading || !data ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Quick Metrics Bar */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                    {data.stats.overallProgress}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overall Progress
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "info.main" }}>
                    {data.stats.totalGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Goals
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
                    {data.stats.completedGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed Goals
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "warning.main" }}>
                    {data.stats.totalCheckins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check-ins Submitted
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab icon={<PersonIcon fontSize="small" />} label="Personal & Contact" iconPosition="start" />
                <Tab icon={<WorkIcon fontSize="small" />} label="Profile & Background" iconPosition="start" />
                <Tab icon={<TrackChangesIcon fontSize="small" />} label="Goals & Performance" iconPosition="start" />
                <Tab icon={<HistoryIcon fontSize="small" />} label="Check-ins History" iconPosition="start" />
              </Tabs>
            </Box>

            {/* Tab 0: Personal & Contact */}
            <TabPanel value={tab} index={0}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.phone}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                    <HomeIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Office Address / Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.address}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
                    <SupervisorAccountIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Reporting Manager</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {data.manager ? `${data.manager.name} (${data.manager.managerCode})` : "Unassigned"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.gender}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Account Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(data.joinedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 1: Profile & Background */}
            <TabPanel value={tab} index={1}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Professional Executive Summary
                </Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {data.profile.summary || "No professional summary provided."}
                  </Typography>
                </Paper>
              </Box>

              {/* Projects */}
              {data.profile.projects && data.profile.projects.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Key Projects &amp; Accomplishments ({data.profile.projects.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {data.profile.projects.map((proj: any) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={proj.id}>
                        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{proj.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>{proj.description}</Typography>
                          <Chip label={proj.technologies} size="small" variant="outlined" sx={{ fontSize: "0.68rem" }} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Educations & Certifications */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Education
                  </Typography>
                  {data.profile.educations && data.profile.educations.length > 0 ? (
                    data.profile.educations.map((edu: any) => (
                      <Paper key={edu.id} elevation={0} sx={{ p: 1.5, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{edu.qualification} - {edu.institution}</Typography>
                        <Typography variant="caption" color="text.secondary">{edu.specialization || ""} {edu.score ? `(${edu.score})` : ""}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">No education details recorded.</Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Certifications
                  </Typography>
                  {data.profile.certifications && data.profile.certifications.length > 0 ? (
                    data.profile.certifications.map((cert: any) => (
                      <Paper key={cert.id} elevation={0} sx={{ p: 1.5, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cert.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Issued by {cert.provider}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">No certifications recorded.</Typography>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Goals & Performance */}
            <TabPanel value={tab} index={2}>
              {data.goals.length === 0 ? (
                <Alert severity="info">No goals recorded for this employee.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Goal Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Thrust Area</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Weightage</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Target</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Achievement</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Progress</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.goals.map((g: any) => (
                        <TableRow key={g.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{g.title}</TableCell>
                          <TableCell>{g.thrustArea}</TableCell>
                          <TableCell align="right">{g.weightage}%</TableCell>
                          <TableCell align="right">{g.target} {g.uom}</TableCell>
                          <TableCell align="right">{g.achievement} {g.uom}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: g.progress === 100 ? "success.main" : "text.primary" }}>
                              {g.progress}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={g.status.replace("_", " ")} color={g.status === "COMPLETED" ? "success" : g.status === "ON_TRACK" ? "warning" : "default"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Tab 3: Check-ins History */}
            <TabPanel value={tab} index={3}>
              {data.checkins.length === 0 ? (
                <Alert severity="info">No check-ins submitted by this employee yet.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Goal Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Achievement</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee Comment</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Manager Feedback</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Review Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.checkins.map((c: any) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                            {new Date(c.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{c.goalTitle}</TableCell>
                          <TableCell align="right">{c.achievement}</TableCell>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{c.employeeComment}</TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{c.managerFeedback || "—"}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={c.status}
                              color={c.status === "APPROVED" ? "success" : c.status === "RETURNED" ? "error" : "warning"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
