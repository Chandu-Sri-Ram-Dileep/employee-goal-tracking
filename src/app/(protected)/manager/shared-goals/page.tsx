"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
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
  CircularProgress,
  Snackbar,
} from "@mui/material";
import HubIcon from "@mui/icons-material/Hub";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

interface Employee {
  id: string;
  name: string;
  department: string;
  employeeCode: string;
}

interface SharedGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  uom: string;
  weightage?: number;
  assignedEmployees: string[];
  status: "ACTIVE" | "COMPLETED";
}

export default function ManagerSharedGoalsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    thrustArea: "",
    target: "",
    uom: "PERCENTAGE",
    weightage: "10",
  });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Query reporting employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ["manager-employees"],
    queryFn: async () => {
      const res = await fetch("/api/manager/my-employees");
      if (!res.ok) throw new Error("Failed to fetch reporting employees");
      return res.json();
    },
  });

  // Query shared goals
  const { data: sharedGoals = [], isLoading: loadingGoals, isError } = useQuery<SharedGoal[]>({
    queryKey: ["shared-goals"],
    queryFn: async () => {
      const res = await fetch("/api/shared-goals");
      if (!res.ok) throw new Error("Failed to fetch shared goals");
      return res.json();
    },
  });

  // Mutation to create shared goal
  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/shared-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error((error as { message?: string }).message || "Failed to create shared goal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-goals"] });
      queryClient.invalidateQueries({ queryKey: ["manager-employees"] });
      setToast({ open: true, message: "Shared goal created and assigned successfully!", severity: "success" });
      setOpen(false);
      // Reset form
      setGoalData({
        title: "",
        description: "",
        thrustArea: "",
        target: "",
        uom: "PERCENTAGE",
        weightage: "10",
      });
      setSelectedEmployees([]);
    },
    onError: (err: Error) => {
      setToast({ open: true, message: err.message || "Something went wrong", severity: "error" });
    },
  });

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleCreateGoal = () => {
    createMutation.mutate({
      title: goalData.title,
      description: goalData.description,
      thrustArea: goalData.thrustArea,
      target: parseFloat(goalData.target),
      weightage: parseInt(goalData.weightage),
      uom: goalData.uom,
      assignedEmployeeIds: selectedEmployees,
    });
  };

  const filteredSharedGoals = sharedGoals.filter((goal) => {
    return (
      goal.title.toLowerCase().includes(search.toLowerCase()) ||
      goal.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loadingGoals || loadingEmployees) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load shared goals.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex" }}>
            <HubIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Shared Goals
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Create department-level goals and simultaneously distribute them to multiple team members.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ fontWeight: 600 }}
        >
          Create Shared Goal
        </Button>
      </Box>

      {/* Search Filter */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search shared goals by title or description..."
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
      </Paper>

      {/* Shared Goals Table */}
      {filteredSharedGoals.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography color="text.secondary">No shared goals found. Click &apos;Create Shared Goal&apos; to launch one.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Goal Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Weightage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Employees</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSharedGoals.map((goal) => (
                <TableRow key={goal.id} hover>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{goal.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{goal.description}</Typography>
                  </TableCell>
                  <TableCell>{goal.target}</TableCell>
                  <TableCell>
                    <Chip label={goal.uom} size="small" variant="outlined" sx={{ fontSize: "0.7rem", fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{goal.weightage ?? 10}%</TableCell>
                  <TableCell>
                    {goal.assignedEmployees.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">None</Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {goal.assignedEmployees.map((name) => (
                          <Chip key={name} label={name} size="small" sx={{ fontSize: "0.75rem" }} />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={goal.status}
                      color={goal.status === "ACTIVE" ? "success" : "default"}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => !createMutation.isPending && setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
          Create &amp; Distribute Shared Goal
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Goal Title"
                  required
                  fullWidth
                  size="small"
                  value={goalData.title}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                />
                <TextField
                  label="Description"
                  required
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={goalData.description}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                />
                <TextField
                  label="Thrust Area"
                  required
                  fullWidth
                  size="small"
                  value={goalData.thrustArea}
                  onChange={(e) => setGoalData({ ...goalData, thrustArea: e.target.value })}
                  placeholder="e.g. Revenue Growth, Product Quality"
                />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Target Value"
                      required
                      fullWidth
                      size="small"
                      type="number"
                      value={goalData.target}
                      onChange={(e) => setGoalData({ ...goalData, target: e.target.value })}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      select
                      label="UOM"
                      required
                      fullWidth
                      size="small"
                      value={goalData.uom}
                      onChange={(e) => setGoalData({ ...goalData, uom: e.target.value })}
                    >
                      <MenuItem value="NUMERIC">Numeric</MenuItem>
                      <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                      <MenuItem value="TIMELINE">Timeline</MenuItem>
                      <MenuItem value="ZERO_BASED">Zero-Based</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <TextField
                  label="Weightage (%)"
                  required
                  fullWidth
                  size="small"
                  type="number"
                  value={goalData.weightage}
                  onChange={(e) => setGoalData({ ...goalData, weightage: e.target.value })}
                  slotProps={{ htmlInput: { min: 1, max: 100 } }}
                />
              </Box>
            </Grid>

            {/* Employee Multi-Select */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Assign to Employees
                </Typography>
                {employees.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No reporting employees available for assignment.</Typography>
                ) : (
                  <Box sx={{ overflowY: "auto", flexGrow: 1, maxHeight: 300, display: "flex", flexDirection: "column", gap: 1 }}>
                    {employees.map((employee) => (
                      <FormControlLabel
                        key={employee.id}
                        control={
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleEmployeeToggle(employee.id)}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{employee.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Code: {employee.employeeCode} | {employee.department}</Typography>
                          </Box>
                        }
                        sx={{ margin: 0, py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={createMutation.isPending} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGoal}
            disabled={
              !goalData.title ||
              !goalData.description ||
              !goalData.thrustArea ||
              !goalData.target ||
              selectedEmployees.length === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Assign Goal"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}