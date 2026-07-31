"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SpeedIcon from "@mui/icons-material/Speed";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManagerInfo {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

interface ActiveCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface TeamStats {
  totalEmployees: number;
  employeesWithSheets: number;
  employeesWithoutSheets: number;
  pendingApprovals: number;
  pendingCheckinReviews: number;
  pendingUnlockRequests: number;
  totalGoals: number;
  completedGoals: number;
  onTrackGoals: number;
  notStartedGoals: number;
  avgTeamProgress: number;
}

interface LeaderboardMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  progress: number;
  goalCount: number;
  completedCount: number;
  sheetStatus: string;
}

interface ManagerDashboardData {
  manager: ManagerInfo;
  activeCycle: ActiveCycle | null;
  stats: TeamStats;
  employeeLeaderboard: LeaderboardMember[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const sheetStatusColor = (status: string) => {
  if (status === "APPROVED") return "#00e676";
  if (status === "SUBMITTED") return "#ffab00";
  if (status === "DRAFT") return "#42a5f5";
  return "#546e7a";
};

// ─── Radial Progress ─────────────────────────────────────────────────────────

function RadialProgress({ value, size = 130 }: { value: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const gap = circ - dash;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={value >= 80 ? "#00e676" : value >= 50 ? "#ffab00" : "#ef5350"}
          strokeWidth={10}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}%</Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.6rem", letterSpacing: 1, textTransform: "uppercase" }}>
          Avg Progress
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

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
        background: "linear-gradient(145deg, #1a1f2e 0%, #151a27 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
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
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { data, isLoading, isError } = useQuery<ManagerDashboardData>({
    queryKey: ["manager-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/manager/dashboard");
      if (!res.ok) throw new Error("Failed to fetch manager dashboard");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 0 }}>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, mb: 3, bgcolor: "rgba(255,255,255,0.05)" }} />
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
        <Alert severity="error">Failed to load manager dashboard data.</Alert>
      </Box>
    );
  }

  const { manager, activeCycle, stats, employeeLeaderboard } = data;

  const initials = manager.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ minHeight: "100vh", color: "#fff" }}>
      {/* ── Hero Header Banner ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          background: "linear-gradient(135deg, #0f1724 0%, #1a2744 50%, #0d1b3e 100%)",
          border: "1px solid rgba(66,165,245,0.2)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(66,165,245,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: "1.5rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #7c4dff, #3f51b5)",
              border: "3px solid rgba(124,77,255,0.4)",
              boxShadow: "0 0 24px rgba(124,77,255,0.3)",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
                {manager.name}
              </Typography>
              <Chip
                label="Manager Dashboard"
                size="small"
                sx={{
                  bgcolor: "rgba(124,77,255,0.15)",
                  color: "#b388ff",
                  fontWeight: 700,
                  border: "1px solid rgba(124,77,255,0.3)",
                  fontSize: "0.7rem",
                  letterSpacing: 0.5,
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>
              {manager.designation} &nbsp;•&nbsp; {manager.department} &nbsp;•&nbsp; {manager.email}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-end" }}>
            {activeCycle ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  background: "rgba(0,230,118,0.1)",
                  border: "1px solid rgba(0,230,118,0.25)",
                }}
              >
                <RadioButtonCheckedIcon sx={{ fontSize: 12, color: "#00e676", animation: "pulse 2s infinite" }} />
                <Typography variant="caption" sx={{ color: "#00e676", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  {activeCycle.name}
                </Typography>
              </Box>
            ) : (
              <Chip label="No Active Cycle" size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }} />
            )}

            {activeCycle && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <CalendarTodayIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>
                  {formatDate(activeCycle.startDate)} — {formatDate(activeCycle.endDate)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* ── Stat KPI Tiles ─────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Direct Reports"
            value={stats.totalEmployees}
            icon={<GroupsIcon />}
            accent="#42a5f5"
            subtitle={`${stats.employeesWithSheets} active goal sheet(s)`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Pending Sheet Approvals"
            value={stats.pendingApprovals}
            icon={<PendingActionsIcon />}
            accent={stats.pendingApprovals > 0 ? "#ffab00" : "#546e7a"}
            subtitle={stats.pendingApprovals > 0 ? "Requires review" : "All approved"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Check-in Reviews"
            value={stats.pendingCheckinReviews}
            icon={<RateReviewIcon />}
            accent={stats.pendingCheckinReviews > 0 ? "#ef5350" : "#00e676"}
            subtitle={stats.pendingCheckinReviews > 0 ? "Pending check-ins" : "No pending check-ins"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Unlock Requests"
            value={stats.pendingUnlockRequests}
            icon={<LockOpenIcon />}
            accent={stats.pendingUnlockRequests > 0 ? "#ab47bc" : "#546e7a"}
            subtitle={stats.pendingUnlockRequests > 0 ? "Requests waiting" : "None pending"}
          />
        </Grid>
      </Grid>

      {/* ── Main Content: Team Progress + Leaderboard ──────────────────────── */}
      <Grid container spacing={3}>

        {/* Left: Overall Team Progress */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: "linear-gradient(145deg, #1a1f2e 0%, #151a27 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 3,
              }}
            >
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontSize: "0.65rem" }}>
                Team Execution Index
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2 }}>
                <RadialProgress value={stats.avgTeamProgress} size={130} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Completed Goals", val: stats.completedGoals, color: "#00e676" },
                    { label: "On Track", val: stats.onTrackGoals, color: "#ffab00" },
                    { label: "Not Started", val: stats.notStartedGoals, color: "#546e7a" },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", minWidth: 95 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}>
                        {item.val}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Quick Metrics */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: "linear-gradient(145deg, #1a1f2e 0%, #151a27 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 3,
              }}
            >
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontSize: "0.65rem" }}>
                Team Health Metrics
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Total Goals Assigned
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700 }}>
                    {stats.totalGoals}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Sheets Created
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700 }}>
                    {stats.employeesWithSheets} / {stats.totalEmployees}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Unsubmitted Sheets
                  </Typography>
                  <Typography variant="body2" sx={{ color: stats.employeesWithoutSheets > 0 ? "#ffab00" : "#00e676", fontWeight: 700 }}>
                    {stats.employeesWithoutSheets}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right: Team Performance Leaderboard */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              background: "linear-gradient(145deg, #1a1f2e 0%, #151a27 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontSize: "0.65rem" }}>
                  Team Direct Reports
                </Typography>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mt: 0.3 }}>
                  Employee Progress Standings
                </Typography>
              </Box>
              <Chip
                label={`${employeeLeaderboard.length} Report(s)`}
                size="small"
                icon={<LeaderboardIcon sx={{ fontSize: "14px !important", color: "#b388ff !important" }} />}
                sx={{ bgcolor: "rgba(124,77,255,0.1)", color: "#b388ff", border: "1px solid rgba(124,77,255,0.2)", fontWeight: 700 }}
              />
            </Box>

            {employeeLeaderboard.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)" }}>
                  No employee reporting data available for the active cycle.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {employeeLeaderboard.map((emp, idx) => (
                  <Box
                    key={emp.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: "rgba(124,77,255,0.05)",
                        border: "1px solid rgba(124,77,255,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700 }}>
                            {emp.name}
                          </Typography>
                          <Chip
                            label={emp.sheetStatus}
                            size="small"
                            sx={{
                              bgcolor: `${sheetStatusColor(emp.sheetStatus)}18`,
                              color: sheetStatusColor(emp.sheetStatus),
                              border: `1px solid ${sheetStatusColor(emp.sheetStatus)}30`,
                              fontWeight: 700,
                              fontSize: "0.62rem",
                              height: 20,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>
                          {emp.designation} &nbsp;•&nbsp; {emp.department}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography variant="body2" sx={{ color: "#fff", fontWeight: 800 }}>
                          {emp.progress}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>
                          {emp.completedCount} / {emp.goalCount} goals completed
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={emp.progress}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            background:
                              emp.progress >= 80
                                ? "linear-gradient(90deg, #00c853, #00e676)"
                                : emp.progress >= 50
                                ? "linear-gradient(90deg, #ff8f00, #ffab00)"
                                : "linear-gradient(90deg, #d32f2f, #ef5350)",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}