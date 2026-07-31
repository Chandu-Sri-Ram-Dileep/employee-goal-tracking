"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

interface AnalyticsData {
  summary: {
    totalEmployees: number;
    activeGoalsCount: number;
    overallRate: number;
    pendingCheckinsCount: number;
  };
  qoqData: Array<{
    quarter: string;
    achievement: number;
    goalsCount: number;
  }>;
  thrustAreaData: Array<{
    thrustArea: string;
    goalsCount: number;
    avgProgress: number;
  }>;
  managerData: Array<{
    id: string;
    managerName: string;
    department: string;
    teamSize: number;
    totalGoals: number;
    avgTeamProgress: number;
    checkinCompletion: number;
  }>;
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 0 }}>
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3, mb: 3, bgcolor: "rgba(255,255,255,0.05)" }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)" }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load analytics data from database.</Alert>
      </Box>
    );
  }

  const { summary, qoqData, thrustAreaData, managerData } = data;

  return (
    <Box sx={{ color: "#fff" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex" }}>
          <AssessmentIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Organization Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Quarter-on-Quarter performance trends, thrust area distributions, and manager effectiveness.
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>
              WORKFORCE SIZE
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", mt: 0.5 }}>
              {summary.totalEmployees}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>
              ACTIVE GOALS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#818cf8", mt: 0.5 }}>
              {summary.activeGoalsCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>
              COMPLETION RATE
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#10b981", mt: 0.5 }}>
              {summary.overallRate}%
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>
              PENDING CHECK-INS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: summary.pendingCheckinsCount > 0 ? "#f59e0b" : "#546e7a", mt: 0.5 }}>
              {summary.pendingCheckinsCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* QoQ Chart & Thrust Area */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* QoQ Bar Graph */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, height: "100%", background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <BarChartIcon sx={{ color: "#818cf8" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Quarter-on-Quarter Goal Achievement
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              {qoqData.map((item) => (
                <Box key={item.quarter}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff" }}>
                      {item.quarter} ({item.goalsCount} goals)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                      {item.achievement}% Avg
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.achievement}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.06)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #6366f1 0%, #10b981 100%)",
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Thrust Area Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, height: "100%", background: "linear-gradient(145deg, #111827, #0f172a)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <PieChartIcon sx={{ color: "#34d399" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Distribution By Thrust Area
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { color: "rgba(255,255,255,0.4)", fontWeight: 700 } }}>
                  <TableCell>Thrust Area</TableCell>
                  <TableCell align="right">Goals</TableCell>
                  <TableCell align="right">Avg Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {thrustAreaData.map((item) => (
                  <TableRow key={item.thrustArea} hover>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{item.thrustArea}</TableCell>
                    <TableCell align="right" sx={{ color: "rgba(255,255,255,0.7)" }}>{item.goalsCount}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${item.avgProgress}%`}
                        size="small"
                        sx={{
                          bgcolor: "rgba(16,185,129,0.1)",
                          color: "#10b981",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Manager Effectiveness */}
      <Paper elevation={0} sx={{ p: 3, background: "linear-gradient(145deg, #111827, #0f172a)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <SupervisorAccountIcon sx={{ color: "#f59e0b" }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Manager Effectiveness & Team Progress
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { color: "rgba(255,255,255,0.4)", fontWeight: 700 } }}>
              <TableCell>Manager</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Team Size</TableCell>
              <TableCell align="right">Total Goals</TableCell>
              <TableCell align="right">Avg Team Progress</TableCell>
              <TableCell align="right">Check-in Completion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {managerData.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell sx={{ color: "#fff", fontWeight: 700 }}>{m.managerName}</TableCell>
                <TableCell sx={{ color: "rgba(255,255,255,0.6)" }}>{m.department}</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>{m.teamSize}</TableCell>
                <TableCell align="right" sx={{ color: "rgba(255,255,255,0.7)" }}>{m.totalGoals}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                    {m.avgTeamProgress}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${m.checkinCompletion}%`}
                    size="small"
                    sx={{
                      bgcolor: m.checkinCompletion >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: m.checkinCompletion >= 80 ? "#10b981" : "#f59e0b",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}