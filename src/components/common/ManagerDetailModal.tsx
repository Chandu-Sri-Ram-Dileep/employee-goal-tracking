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
import GroupIcon from "@mui/icons-material/Group";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import RateReviewIcon from "@mui/icons-material/RateReview";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";

interface ManagerDetailModalProps {
  managerId: string | null;
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

export default function ManagerDetailModal({ managerId, open, onClose }: ManagerDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open && managerId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/manager-detail/${managerId}`);
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
  }, [open, managerId]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ p: 0, bgcolor: "#0f172a", color: "#fff" }}>
        {loading || !data ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Loading Manager Profile...</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)" }}>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size="auto">
                <Avatar
                  src={data.profilePhoto || undefined}
                  sx={{ width: 64, height: 64, bgcolor: "warning.main", fontSize: "1.5rem", fontWeight: 700 }}
                >
                  {data.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid size="grow">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
                    {data.name}
                  </Typography>
                  <Chip label="MANAGER" size="small" color="warning" sx={{ fontWeight: 700 }} />
                  <Chip label={data.status} size="small" color={data.status === "ACTIVE" ? "success" : "default"} sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
                  Manager Code: <strong>{data.managerCode}</strong> • {data.department} Department
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
            {/* Stats Overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "warning.main" }}>
                    {data.stats.totalTeamSize}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Direct Reports</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                    {data.stats.totalTeamGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Team Goals</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
                    {data.stats.approvedCheckins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Check-ins Approved</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "error.main" }}>
                    {data.stats.returnedCheckins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Check-ins Returned</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab icon={<PersonIcon fontSize="small" />} label="Personal & Contact" iconPosition="start" />
                <Tab icon={<GroupIcon fontSize="small" />} label="Direct Reports Team" iconPosition="start" />
                <Tab icon={<TrackChangesIcon fontSize="small" />} label="Team Goals Executed" iconPosition="start" />
                <Tab icon={<RateReviewIcon fontSize="small" />} label="Check-in Reviews Log" iconPosition="start" />
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.gender}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Management Experience</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.profile?.totalExperience || 0} Years</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Executive Summary</Typography>
                    <Typography variant="body2" color="text.secondary">{data.profile?.summary || "No executive summary provided."}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 1: Direct Reports Team */}
            <TabPanel value={tab} index={1}>
              {data.employees.length === 0 ? (
                <Alert severity="info">No direct reports currently assigned to this manager.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Goals</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Overall Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.employees.map((emp: any) => (
                        <TableRow key={emp.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{emp.employeeCode}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>{emp.designation}</TableCell>
                          <TableCell align="right">{emp.goalsCount}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: emp.overallProgress === 100 ? "success.main" : "text.primary" }}>
                              {emp.overallProgress}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Tab 2: Team Goals Executed */}
            <TabPanel value={tab} index={2}>
              {data.teamGoals.length === 0 ? (
                <Alert severity="info">No team goals currently being executed under this manager.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Goal Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Target</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Achievement</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Progress</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Goal Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.teamGoals.map((tg: any) => (
                        <TableRow key={tg.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{tg.employeeName} ({tg.employeeCode})</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{tg.goalTitle}</TableCell>
                          <TableCell align="right">{tg.target}</TableCell>
                          <TableCell align="right">{tg.achievement}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{tg.progress}%</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={tg.status.replace("_", " ")} color={tg.status === "COMPLETED" ? "success" : tg.status === "ON_TRACK" ? "warning" : "default"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Tab 3: Check-in Reviews Log */}
            <TabPanel value={tab} index={3}>
              {data.checkinReviews.length === 0 ? (
                <Alert severity="info">No check-in reviews logged under this manager yet.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Goal Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee Comment</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Manager Feedback</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Review Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.checkinReviews.map((c: any) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                            {new Date(c.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{c.employeeName}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{c.goalTitle}</TableCell>
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
