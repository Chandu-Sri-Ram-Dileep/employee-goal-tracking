"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LoopIcon from "@mui/icons-material/Loop";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";

interface AdminDashboardData {
  stats: {
    totalEmployees: number;
    totalManagers: number;
    totalCycles: number;
    departmentCount: number;
    pendingUnlockRequests: number;
    totalSharedGoals: number;
    totalGoalsAssigned: number;
    totalGoalsCompleted: number;
    avgGoalProgress: number;
  };
  activeCycle: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    goalSheetsCount: number;
  } | null;
  departments: Array<{
    department: string;
    employeeCount: number;
  }>;
}

function StatTile({
  label, value, icon, accent, subtitle,
}: {
  label: string; value: number | string; icon: React.ReactNode; accent: string; subtitle?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        background: "linear-gradient(145deg, #111827 0%, #0f172a 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: accent,
          borderRadius: "3px 3px 0 0",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontSize: "0.65rem" }}
          >
            {label}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", mt: 0.5, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: `${accent}22`,
            color: accent,
            display: "flex",
            "& svg": { fontSize: 26 },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch admin dashboard");
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
              <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)" }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load admin dashboard statistics.</Alert>
      </Box>
    );
  }

  const { stats, activeCycle, departments } = data;

  return (
    <Box sx={{ color: "#fff" }}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
                Admin Command Center
              </Typography>
              <Chip
                label="System Active"
                size="small"
                sx={{ bgcolor: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              Organization-wide PMS performance, user allocations, and system health status.
            </Typography>
          </Box>

          {activeCycle ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
                textAlign: "right",
              }}
            >
              <Typography variant="caption" sx={{ color: "#818cf8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block" }}>
                Active Cycle: {activeCycle.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                {activeCycle.goalSheetsCount} Goal Sheet(s) Active
              </Typography>
            </Box>
          ) : (
            <Chip label="No Active Cycle" size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }} />
          )}
        </Box>
      </Paper>

      {/* KPI Tiles */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Total Workforce"
            value={stats.totalEmployees}
            icon={<PeopleIcon />}
            accent="#6366f1"
            subtitle={`${stats.totalManagers} Managers`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Goal Cycles"
            value={stats.totalCycles}
            icon={<LoopIcon />}
            accent="#10b981"
            subtitle={activeCycle ? "1 Active cycle running" : "0 Active cycles"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Unlock Requests"
            value={stats.pendingUnlockRequests}
            icon={<LockOpenIcon />}
            accent={stats.pendingUnlockRequests > 0 ? "#ef4444" : "#546e7a"}
            subtitle={stats.pendingUnlockRequests > 0 ? "Requires admin review" : "All requests resolved"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Departments"
            value={stats.departmentCount}
            icon={<ApartmentIcon />}
            accent="#f59e0b"
            subtitle={`${stats.totalSharedGoals} Shared template goals`}
          />
        </Grid>
      </Grid>

      {/* Main Grid: Goal Completion + Department Breakdown */}
      <Grid container spacing={3}>

        {/* Left: Overall Execution Meter */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              background: "linear-gradient(145deg, #111827 0%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontSize: "0.65rem" }}>
                  Global Progress
                </Typography>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                  Organization Goal Execution Rate
                </Typography>
              </Box>
              <Chip
                label={`${stats.avgGoalProgress}% Avg`}
                size="small"
                icon={<SpeedIcon sx={{ fontSize: "14px !important", color: "#10b981 !important" }} />}
                sx={{ bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ my: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Overall Weighted Achievement
                </Typography>
                <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 800 }}>
                  {stats.avgGoalProgress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.avgGoalProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "rgba(255,255,255,0.06)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    background: "linear-gradient(90deg, #6366f1 0%, #10b981 100%)",
                  },
                }}
              />
            </Box>

            <Stack spacing={2} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  Total Goals Assigned
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700 }}>
                  {stats.totalGoalsAssigned}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  Total Goals Completed
                </Typography>
                <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                  {stats.totalGoalsCompleted}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Department Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              background: "linear-gradient(145deg, #111827 0%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
            }}
          >
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontSize: "0.65rem" }}>
              Workforce Allocation
            </Typography>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 3 }}>
              Employees per Department
            </Typography>

            <Stack spacing={2}>
              {departments.map((dept) => {
                const pct = stats.totalEmployees > 0 ? Math.round((dept.employeeCount / stats.totalEmployees) * 100) : 0;
                return (
                  <Box key={dept.department}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                        {dept.department}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                        {dept.employeeCount} ({pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.06)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          bgcolor: "#6366f1",
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}