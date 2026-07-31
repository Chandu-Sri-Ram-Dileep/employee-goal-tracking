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
  Typography,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

const COLORS = ["#1976d2", "#16a34a", "#f59e0b", "#dc2626"];

interface PerformanceData {
  summary: {
    totalGoals: number;
    completedGoals: number;
    onTrackGoals: number;
    notStartedGoals: number;
    overallPerformance: number;
    totalWeightage: number;
    achievedWeightage: number;
  };
  goalDetails: Array<{
    id: string;
    title: string;
    thrustArea: string;
    target: number;
    achievement: number;
    progress: number;
    weightage: number;
    status: string;
    performanceScore: number;
    cycle: string;
    startDate: string;
    endDate: string;
  }>;
  ranking: {
    currentRank: number;
    totalEmployees: number;
    percentile: number;
  };
  topPerformers: Array<{
    employeeId: string;
    employeeName: string;
    performance: number;
  }>;
}

export default function EmployeePerformancePage() {
  const { data: performanceData, isLoading } = useQuery<PerformanceData>({
    queryKey: ["employee-performance"],
    queryFn: async () => {
      const response = await fetch("/api/employee/performance");
      const data = await response.json();
      return data;
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Performance History
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, md: 3 }}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  if (!performanceData) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Performance History
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          No performance data available
        </Alert>
      </Box>
    );
  }

  const { summary, goalDetails, ranking, topPerformers } = performanceData || {
    summary: { totalGoals: 0, completedGoals: 0, onTrackGoals: 0, notStartedGoals: 0, overallPerformance: 0, totalWeightage: 0, achievedWeightage: 0 },
    goalDetails: [],
    ranking: { currentRank: 0, totalEmployees: 0, percentile: 0 },
    topPerformers: []
  };

  const pieData = [
    { name: "Completed", value: summary.completedGoals },
    { name: "On Track", value: summary.onTrackGoals },
    { name: "Not Started", value: summary.notStartedGoals },
  ];

  const barData = goalDetails.slice(0, 10).map((goal) => ({
    name: goal.title.substring(0, 15) + (goal.title.length > 15 ? "..." : ""),
    progress: goal.progress,
    weightage: goal.weightage,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Performance History
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        View your goal achievements, progress, and ranking among peers.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summary.totalGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Goals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <EmojiEventsIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summary.completedGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrackChangesIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summary.onTrackGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On Track
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summary.overallPerformance}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Performance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Goal Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#888888"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Your Ranking
            </Typography>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: "primary.main" }}>
                #{ranking.currentRank}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                out of {ranking.totalEmployees} employees
              </Typography>
              <Chip
                label={`Top ${ranking.percentile}%`}
                color="success"
                sx={{ mt: 2 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Goal Progress Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" fill="#1976d2" name="Progress %" />
            <Bar dataKey="weightage" fill="#16a34a" name="Weightage %" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Top Performers in Your Department
        </Typography>
        <Grid container spacing={2}>
          {topPerformers.map((performer, index) => (
            <Grid key={performer.employeeId} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: index === 0 ? "warning.main" : "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {performer.employeeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {performer.performance.toFixed(1)}% performance
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Goal Details
      </Typography>
      <Grid container spacing={3}>
        {goalDetails.map((goal) => (
          <Grid key={goal.id} size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {goal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {goal.thrustArea} • {goal.cycle}
                </Typography>
                <Chip
                  label={goal.status}
                  size="small"
                  color={
                    goal.status === "COMPLETED"
                      ? "success"
                      : goal.status === "ON_TRACK"
                      ? "warning"
                      : "default"
                  }
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Progress: {goal.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Target: {goal.target}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Achievement: {goal.achievement}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Weightage: {goal.weightage}%
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Score: {goal.performanceScore.toFixed(1)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}