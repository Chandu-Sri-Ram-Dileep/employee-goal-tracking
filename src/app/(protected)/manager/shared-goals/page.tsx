"use client";

import { useState } from "react";

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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface SharedGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  uom: string;
  assignedEmployees: string[];
  status: "ACTIVE" | "COMPLETED";
}

const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    name: "John Doe",
    department: "Sales",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    department: "Sales",
  },
  {
    id: "EMP003",
    name: "Michael Brown",
    department: "Sales",
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    department: "Sales",
  },
];

const mockSharedGoals: SharedGoal[] = [
  {
    id: "SG001",
    title: "Increase Department Revenue",
    description:
      "Increase total department revenue by 20%",
    target: "20%",
    uom: "PERCENTAGE",
    assignedEmployees: [
      "John Doe",
      "Jane Smith",
    ],
    status: "ACTIVE",
  },
];

export default function ManagerSharedGoalsPage() {
  const [sharedGoals, setSharedGoals] =
    useState(mockSharedGoals);

  const [open, setOpen] =
    useState(false);

  const [selectedEmployees, setSelectedEmployees] =
    useState<string[]>([]);

  const [goalData, setGoalData] =
    useState({
      title: "",
      description: "",
      target: "",
      uom: "",
    });

  const handleEmployeeToggle = (
    employeeName: string
  ) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeName)
        ? prev.filter(
            (name) =>
              name !== employeeName
          )
        : [...prev, employeeName]
    );
  };

  const handleCreateGoal = () => {
    /*
    ======================================

    BACKEND API

    POST /api/shared-goals

    Request

    {
      title,
      description,
      target,
      uom,
      assignedEmployeeIds:[]
    }

    ======================================
    */

    const newGoal: SharedGoal = {
      id:
        "SG" +
        String(
          sharedGoals.length + 1
        ).padStart(3, "0"),

      title: goalData.title,

      description:
        goalData.description,

      target: goalData.target,

      uom: goalData.uom,

      assignedEmployees:
        selectedEmployees,

      status: "ACTIVE",
    };

    setSharedGoals([
      newGoal,
      ...sharedGoals,
    ]);

    setGoalData({
      title: "",
      description: "",
      target: "",
      uom: "",
    });

    setSelectedEmployees([]);

    setOpen(false);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Shared Goals
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Create department-level goals
        and assign them to multiple
        employees.
      </Alert>

      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() =>
          setOpen(true)
        }
      >
        Create Shared Goal
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Goal Title
              </TableCell>

              <TableCell>
                Target
              </TableCell>

              <TableCell>
                UOM
              </TableCell>

              <TableCell>
                Employees
              </TableCell>

              <TableCell>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sharedGoals.map((goal) => (
              <TableRow
                key={goal.id}
              >
                <TableCell>
                  {goal.title}
                </TableCell>

                <TableCell>
                  {goal.target}
                </TableCell>

                <TableCell>
                  {goal.uom}
                </TableCell>

                <TableCell>
                  {
                    goal
                      .assignedEmployees
                      .length
                  }
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      goal.status
                    }
                    color={
                      goal.status ===
                      "ACTIVE"
                        ? "success"
                        : "default"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Shared Goal
        </DialogTitle>

        <DialogContent>
          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
          >
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Goal Title"
                fullWidth
                value={
                  goalData.title
                }
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    title:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={
                  goalData.description
                }
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    description:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Target"
                fullWidth
                value={
                  goalData.target
                }
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    target:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="UOM"
                fullWidth
                value={
                  goalData.uom
                }
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    uom:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                sx={{ mt: 2 }}
              >
                Select Employees
              </Typography>

              {mockEmployees.map(
                (employee) => (
                  <FormControlLabel
                    key={
                      employee.id
                    }
                    control={
                      <Checkbox
                        checked={selectedEmployees.includes(
                          employee.name
                        )}
                        onChange={() =>
                          handleEmployeeToggle(
                            employee.name
                          )
                        }
                      />
                    }
                    label={`${employee.name} (${employee.department})`}
                  />
                )
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCreateGoal
            }
            disabled={
              !goalData.title ||
              selectedEmployees.length ===
                0
            }
          >
            Assign Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}