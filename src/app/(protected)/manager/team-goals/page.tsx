"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

interface TeamGoal {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  cycleName?: string;
  sheetStatus?: string;
  goalTitle: string;
  description: string;
  target: string;
  achievement: string;
  progress: number;
  weightage: number;
  status: "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
}

export default function TeamGoalsPage() {
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: teamGoals = [], isLoading, isError } = useQuery<TeamGoal[]>({
    queryKey: ["manager-team-goals"],
    queryFn: async () => {
      const res = await fetch("/api/manager/team-goals");
      if (!res.ok) throw new Error("Failed to fetch team goals");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const uniqueEmployees = Array.from(new Set(teamGoals.map((g) => g.employeeName)));

  const filteredGoals = teamGoals.filter((goal) => {
    const matchSearch =
      goal.goalTitle.toLowerCase().includes(search.toLowerCase()) ||
      goal.description.toLowerCase().includes(search.toLowerCase()) ||
      goal.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      goal.employeeCode.toLowerCase().includes(search.toLowerCase());
    
    const matchEmployee = employeeFilter === "ALL" || goal.employeeName === employeeFilter;
    const matchStatus = statusFilter === "ALL" || goal.status === statusFilter;

    return matchSearch && matchEmployee && matchStatus;
  });

  // Calculate summary stats
  const completedCount = teamGoals.filter((g) => g.status === "COMPLETED").length;
  const onTrackCount = teamGoals.filter((g) => g.status === "ON_TRACK").length;
  const notStartedCount = teamGoals.filter((g) => g.status === "NOT_STARTED").length;

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
        <Alert severity="error">Failed to load team goals.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "success.main", color: "white", display: "flex" }}>
          <TrackChangesIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Team Goals Overview
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Monitor all assigned team goals, targets, and execution progress across your direct reports.
          </Typography>
        </Box>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ my: 2 }}>
        {[
          { label: "Total Team Goals", value: teamGoals.length, color: "primary.main" },
          { label: "Completed Goals", value: completedCount, color: "success.main" },
          { label: "On Track Goals", value: onTrackCount, color: "warning.main" },
          { label: "Not Started", value: notStartedCount, color: "text.secondary" },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by goal title, description, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Employee"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Employees</MenuItem>
              {uniqueEmployees.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="NOT_STARTED">Not Started</MenuItem>
              <MenuItem value="ON_TRACK">On Track</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography color="text.secondary">No team goals match your selected filters.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredGoals.map((goal) => (
            <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}>
                        {goal.goalTitle}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: "block", mt: 0.5 }}>
                        {goal.employeeName} ({goal.employeeCode}) • {goal.department}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {goal.sheetStatus && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Sheet: ${goal.sheetStatus}`}
                          color={goal.sheetStatus === "APPROVED" || goal.sheetStatus === "LOCKED" ? "success" : "default"}
                          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      )}
                      <Chip
                        size="small"
                        label={goal.status.replace("_", " ")}
                        color={
                          goal.status === "COMPLETED"
                            ? "success"
                            : goal.status === "ON_TRACK"
                            ? "warning"
                            : "default"
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {goal.description}
                  </Typography>

                  <Box sx={{ mt: "auto", borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Target
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {goal.target}
                        </Typography>
                      </Grid>
                      <Grid size={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Achievement
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {goal.achievement}
                        </Typography>
                      </Grid>
                      <Grid size={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Weightage
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {goal.weightage}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Goal Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {goal.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={goal.progress}
                        sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}