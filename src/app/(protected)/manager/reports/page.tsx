"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Button } from "@mui/material";
import { exportToCsv } from "@/lib/exportCsv";
import { exportToPdf } from "@/lib/exportPdf";

interface TeamSummary {
  totalEmployees: number;
  avgProgress: number;
  totalGoalsAssigned: number;
  totalGoalsCompleted: number;
}

interface TeamMemberProgress {
  id: string;
  employeeName: string;
  department: string;
  goalsAssigned: number;
  goalsCompleted: number;
  progress: number;
}

export default function ManagerReportsPage() {
  // Query team summary
  const { data: summary, isLoading: loadingSummary, isError: summaryError } = useQuery<TeamSummary>({
    queryKey: ["reports-team-summary"],
    queryFn: async () => {
      const res = await fetch("/api/reports/team-summary");
      if (!res.ok) throw new Error("Failed to fetch team summary reports");
      return res.json();
    },
  });

  // Query team members progress
  const { data: teamProgress = [], isLoading: loadingProgress, isError: progressError } = useQuery<TeamMemberProgress[]>({
    queryKey: ["reports-team-progress"],
    queryFn: async () => {
      const res = await fetch("/api/reports/team-progress");
      if (!res.ok) throw new Error("Failed to fetch team progress reports");
      return res.json();
    },
  });

  const isLoading = loadingSummary || loadingProgress;
  const isError = summaryError || progressError;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load team report data.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "info.main", color: "white", display: "flex" }}>
            <AssessmentIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Team Reports &amp; Insights
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Analyze goal sheets, target execution progress, and completion summary across your direct reports.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportToCsv("Team_Performance_Report", teamProgress)}
            sx={{ fontWeight: 700 }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PictureAsPdfIcon />}
            onClick={() =>
              exportToPdf(
                "Team_Performance_Report",
                teamProgress.map((e) => ({
                  "Employee": e.employeeName,
                  "Department": e.department,
                  "Goals Assigned": e.goalsAssigned,
                  "Goals Completed": e.goalsCompleted,
                  "Progress (%)": e.progress,
                }))
              )
            }
            sx={{ fontWeight: 700 }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Team Members
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {summary?.totalEmployees ?? 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "info.light", color: "info.main" }}>
                <GroupIcon />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Goals Assigned
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {summary?.totalGoalsAssigned ?? 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.light", color: "primary.main" }}>
                <PlaylistAddCheckIcon />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Goals Completed
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {summary?.totalGoalsCompleted ?? 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "success.light", color: "success.main" }}>
                <PlaylistAddCheckIcon />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Avg Team Progress
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {summary?.avgProgress ?? 0}%
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "warning.light", color: "warning.main" }}>
                <AutoGraphIcon />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Table */}
      <Paper elevation={0} sx={{ mt: 4, p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Team Progress Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track individual team member achievements, total goals assigned, goals completed, and overall percentage completion.
        </Typography>

        {teamProgress.length === 0 ? (
          <Alert severity="warning">No team progress data available.</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Goals Assigned</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Goals Completed</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Overall Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamProgress.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>{employee.employeeName}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell align="right">{employee.goalsAssigned}</TableCell>
                    <TableCell align="right">{employee.goalsCompleted}</TableCell>
                    <TableCell sx={{ width: "35%", py: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={employee.progress}
                        sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}