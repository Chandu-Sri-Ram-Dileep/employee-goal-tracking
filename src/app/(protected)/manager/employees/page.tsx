"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmployeeDetailModal from "@/components/common/EmployeeDetailModal";

interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: number;
  achievement: number;
  weightage: number;
  progress: number;
  status: string;
}

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  goalSheetId: string | null;
  goalSheetStatus: string;
  checkinStatus: string;
  overallProgress: number;
  goals: Goal[];
}

export default function MyEmployeesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<"goals" | "performance" | null>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  const { data: employees = [], isLoading, isError } = useQuery<Employee[]>({
    queryKey: ["manager-employees"],
    queryFn: async () => {
      const res = await fetch("/api/manager/my-employees");
      if (!res.ok) throw new Error("Failed to fetch reporting employees");
      return res.json();
    },
  });

  const uniqueDepts = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "ALL" || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleOpenDialog = (employee: Employee, mode: "goals" | "performance") => {
    setSelectedEmployee(employee);
    setViewMode(mode);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    setViewMode(null);
  };

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
        <Alert severity="error">Failed to load reporting employees.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Banner */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex" }}>
          <GroupIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Direct Reports
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Monitor and support the performance, goal sheets, check-ins, and complete profile details of your team members.
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, code, designation..."
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              {uniqueDepts.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid of Cards */}
      {filteredEmployees.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography color="text.secondary">No reporting employees match your filters.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid size={{ xs: 12, md: 6 }} key={employee.id}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, transition: "0.2s", "&:hover": { boxShadow: 3 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.light", width: 48, height: 48 }}>
                      {employee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.employeeCode} • {employee.designation} ({employee.department})
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setDetailModalId(employee.id)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Full Details
                    </Button>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        Goal Sheet Status
                      </Typography>
                      <Chip
                        sx={{ mt: 0.5, fontWeight: 600 }}
                        size="small"
                        label={employee.goalSheetStatus}
                        color={
                          employee.goalSheetStatus === "APPROVED"
                            ? "success"
                            : employee.goalSheetStatus === "SUBMITTED"
                            ? "warning"
                            : "default"
                        }
                      />
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        Check-in Reviews
                      </Typography>
                      <Chip
                        sx={{ mt: 0.5, fontWeight: 600 }}
                        size="small"
                        label={employee.checkinStatus === "SUBMITTED" ? "REVIEW REQUIRED" : employee.checkinStatus}
                        color={
                          employee.checkinStatus === "APPROVED"
                            ? "success"
                            : employee.checkinStatus === "SUBMITTED"
                            ? "error"
                            : "default"
                        }
                        variant={employee.checkinStatus === "SUBMITTED" ? "filled" : "outlined"}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Overall Goal Progress
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                        {employee.overallProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={employee.overallProgress}
                      sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<EmojiEventsIcon />}
                      onClick={() => handleOpenDialog(employee, "goals")}
                    >
                      Goals ({employee.goals.length})
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<AssessmentIcon />}
                      onClick={() => handleOpenDialog(employee, "performance")}
                    >
                      Performance
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for Goals Detail / Performance Detail */}
      <Dialog open={!!selectedEmployee} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          {selectedEmployee && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {selectedEmployee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {selectedEmployee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewMode === "goals" ? "Active Goal Sheet Goals" : "Employee Performance Overview"}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
          {selectedEmployee && viewMode === "goals" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {selectedEmployee.goals.length === 0 ? (
                <Alert severity="warning">No goals defined in this employee&apos;s active goal sheet.</Alert>
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
                      {selectedEmployee.goals.map((goal) => (
                        <TableRow key={goal.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{goal.title}</TableCell>
                          <TableCell>{goal.thrustArea}</TableCell>
                          <TableCell align="right">{goal.weightage}%</TableCell>
                          <TableCell align="right">{goal.target} {goal.uom}</TableCell>
                          <TableCell align="right">{goal.achievement} {goal.uom}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {goal.progress}%
                            </Typography>
                          </TableCell>
                          <TableCell>
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
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {selectedEmployee && viewMode === "performance" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
              {/* Summary Stats */}
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {selectedEmployee.goals.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Goals
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                      {selectedEmployee.goals.filter((g) => g.status === "COMPLETED").length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Goals Completed
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "info.main" }}>
                      {selectedEmployee.overallProgress}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Overall Progress
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Progress Summary */}
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Goal Completion Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Based on current progress of all active goals and their weighted contribution.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <CircularProgress
                      variant="determinate"
                      value={selectedEmployee.overallProgress}
                      size={60}
                      thickness={5}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" component="div" sx={{ fontWeight: 700 }}>
                        {selectedEmployee.overallProgress}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Status: {selectedEmployee.overallProgress === 100 ? "Completed All Goals" : selectedEmployee.overallProgress >= 70 ? "High Performer" : "In Progress"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Review direct reports check-ins weekly to ensure goals remain on track.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comprehensive Employee Detail Modal */}
      <EmployeeDetailModal
        employeeId={detailModalId}
        open={Boolean(detailModalId)}
        onClose={() => setDetailModalId(null)}
      />
    </Box>
  );
}