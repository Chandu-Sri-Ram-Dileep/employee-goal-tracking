"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LockIcon from "@mui/icons-material/Lock";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SpeedIcon from "@mui/icons-material/Speed";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentGoal {
  id: string;
  title: string;
  thrustArea: string;
  target: number;
  achievement: number;
  progress: number;
  weightage: number;
  status: string;
  uom: string;
}

interface DashboardData {
  employee: {
    name: string;
    email: string;
    employeeCode: string;
    department: string;
    designation: string;
    managerName: string | null;
  };
  activeCycle: { id: string; name: string; startDate: string; endDate: string } | null;
  goalSheet: {
    id: string;
    status: string;
    isLocked: boolean;
    cycleName: string;
    submittedAt: string | null;
    approvedAt: string | null;
  } | null;
  stats: {
    totalGoals: number;
    completedGoals: number;
    onTrackGoals: number;
    notStartedGoals: number;
    overallProgress: number;
    pendingCheckins: number;
    totalSheets: number;
  };
  recentGoals: RecentGoal[];
  hasUnlockRequest: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColor = (status: string) => {
  if (status === "COMPLETED") return "#00e676";
  if (status === "ON_TRACK") return "#ffab00";
  return "#546e7a";
};

const statusLabel = (status: string) => {
  if (status === "COMPLETED") return "Completed";
  if (status === "ON_TRACK") return "On Track";
  return "Not Started";
};

const sheetStatusColor = (status: string) => {
  if (status === "APPROVED") return "#00e676";
  if (status === "SUBMITTED") return "#ffab00";
  if (status === "DRAFT") return "#42a5f5";
  return "#546e7a";
};

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Radial Progress ─────────────────────────────────────────────────────────

function RadialProgress({ value, size = 120 }: { value: number; size?: number }) {
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
          Progress
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

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["employee-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/employee/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  // ── Loading skeleton ──
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
        <Alert severity="error">Failed to load dashboard data.</Alert>
      </Box>
    );
  }

  const { employee, activeCycle, goalSheet, stats, recentGoals, hasUnlockRequest } = data;

  const initials = employee.name
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
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -60,
            left: "30%",
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)",
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
              background: "linear-gradient(135deg, #42a5f5, #1565c0)",
              border: "3px solid rgba(66,165,245,0.4)",
              boxShadow: "0 0 24px rgba(66,165,245,0.3)",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
                {employee.name}
              </Typography>
              <Chip
                label={employee.designation}
                size="small"
                sx={{
                  bgcolor: "rgba(66,165,245,0.15)",
                  color: "#42a5f5",
                  fontWeight: 700,
                  border: "1px solid rgba(66,165,245,0.3)",
                  fontSize: "0.7rem",
                  letterSpacing: 0.5,
                }}
              />
              {employee.managerName && (
                <Chip
                  label={`Reports to: ${employee.managerName}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: "0.68rem" }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>
              {employee.employeeCode} &nbsp;•&nbsp; {employee.department} &nbsp;•&nbsp; {employee.email}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-end" }}>
            {/* Active Cycle Badge */}
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

            {/* Goal Sheet Status */}
            {goalSheet && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {goalSheet.isLocked && <LockIcon sx={{ fontSize: 14, color: "#ef5350" }} />}
                <Chip
                  label={goalSheet.status}
                  size="small"
                  sx={{
                    bgcolor: `${sheetStatusColor(goalSheet.status)}18`,
                    color: sheetStatusColor(goalSheet.status),
                    border: `1px solid ${sheetStatusColor(goalSheet.status)}40`,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
                {hasUnlockRequest && (
                  <Chip label="Unlock Requested" size="small" sx={{ bgcolor: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", fontSize: "0.65rem" }} />
                )}
              </Box>
            )}

            {/* Cycle Dates */}
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
            label="Total Goals"
            value={stats.totalGoals}
            icon={<AssignmentIcon />}
            accent="#42a5f5"
            subtitle={`${stats.totalSheets} cycle(s)`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Completed"
            value={stats.completedGoals}
            icon={<CheckCircleIcon />}
            accent="#00e676"
            subtitle={`${stats.onTrackGoals} on track`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Overall Progress"
            value={`${stats.overallProgress}%`}
            icon={<SpeedIcon />}
            accent={stats.overallProgress >= 80 ? "#00e676" : stats.overallProgress >= 50 ? "#ffab00" : "#ef5350"}
            subtitle="Weighted avg."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Pending Checkins"
            value={stats.pendingCheckins}
            icon={<NotificationsActiveIcon />}
            accent={stats.pendingCheckins > 0 ? "#ef5350" : "#546e7a"}
            subtitle={stats.pendingCheckins > 0 ? "Review needed" : "All clear"}
          />
        </Grid>
      </Grid>

      {/* ── Main Content: Progress Overview + Goals ─────────────────────────── */}
      <Grid container spacing={3}>

        {/* Left: Progress Ring + Goal Sheet Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Progress Radial Card */}
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
                Execution Score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2 }}>
                <RadialProgress value={stats.overallProgress} size={130} />
                <Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      { label: "Completed", val: stats.completedGoals, color: "#00e676" },
                      { label: "On Track", val: stats.onTrackGoals, color: "#ffab00" },
                      { label: "Not Started", val: stats.notStartedGoals, color: "#546e7a" },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", minWidth: 80 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}>
                          {item.val}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Goal Sheet Card */}
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
                Current Goal Sheet
              </Typography>
              {goalSheet ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                      {goalSheet.cycleName}
                    </Typography>
                    <Chip
                      label={goalSheet.status}
                      size="small"
                      sx={{
                        bgcolor: `${sheetStatusColor(goalSheet.status)}18`,
                        color: sheetStatusColor(goalSheet.status),
                        border: `1px solid ${sheetStatusColor(goalSheet.status)}30`,
                        fontWeight: 700,
                        fontSize: "0.65rem",
                      }}
                    />
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 2 }} />
                  <Stack spacing={1.5}>
                    {[
                      { label: "Submitted", val: formatDate(goalSheet.submittedAt) },
                      { label: "Approved", val: formatDate(goalSheet.approvedAt) },
                      { label: "Locked", val: goalSheet.isLocked ? "Yes" : "No" },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>
                          {row.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.7rem" }}>
                          {row.val}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", mt: 2, fontStyle: "italic" }}>
                  No goal sheet found for the active cycle.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>

        {/* Right: Goal List */}
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
                  Goal Execution Board
                </Typography>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mt: 0.3 }}>
                  Active Goals Overview
                </Typography>
              </Box>
              <Chip
                label={`${recentGoals.length} goal${recentGoals.length !== 1 ? "s" : ""}`}
                size="small"
                icon={<FlagIcon sx={{ fontSize: "14px !important", color: "#42a5f5 !important" }} />}
                sx={{ bgcolor: "rgba(66,165,245,0.1)", color: "#42a5f5", border: "1px solid rgba(66,165,245,0.2)", fontWeight: 700 }}
              />
            </Box>

            {recentGoals.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <EmojiEventsIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)" }}>
                  No goals found. Start by creating a goal sheet.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {recentGoals.map((goal, idx) => (
                  <Box
                    key={goal.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: "rgba(66,165,245,0.05)",
                        border: "1px solid rgba(66,165,245,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.3 }}>
                          {goal.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>
                          {goal.thrustArea} &nbsp;•&nbsp; {goal.weightage}% weight
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", display: "block" }}>
                            {goal.achievement} / {goal.target} {goal.uom}
                          </Typography>
                        </Box>
                        <Tooltip title={statusLabel(goal.status)}>
                          <Chip
                            label={statusLabel(goal.status)}
                            size="small"
                            sx={{
                              bgcolor: `${statusColor(goal.status)}18`,
                              color: statusColor(goal.status),
                              border: `1px solid ${statusColor(goal.status)}30`,
                              fontWeight: 700,
                              fontSize: "0.62rem",
                              height: 22,
                            }}
                          />
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: statusColor(goal.status), fontWeight: 700, fontSize: "0.7rem" }}>
                          {goal.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={goal.progress}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${statusColor(goal.status)}88, ${statusColor(goal.status)})`,
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

      {/* Pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
}