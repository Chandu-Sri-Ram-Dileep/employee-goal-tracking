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
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  goalType: "COMPANY" | "DEPARTMENT";
  department?: string;

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
    department: "Engineering",
  },
  {
    id: "EMP003",
    name: "Michael Brown",
    department: "Sales",
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    department: "HR",
  },
  {
    id: "EMP005",
    name: "David Lee",
    department: "Engineering",
  },
];

const mockSharedGoals: SharedGoal[] = [
  {
    id: "SG001",

    goalType: "COMPANY",

    title: "Improve Customer Satisfaction",

    description:
      "Increase company-wide customer satisfaction score",

    target: "95",

    uom: "PERCENTAGE",

    assignedEmployees: [
      "John Doe",
      "Jane Smith",
      "Michael Brown",
      "Sarah Wilson",
      "David Lee",
    ],

    status: "ACTIVE",
  },

  {
    id: "SG002",

    goalType: "DEPARTMENT",

    department: "Sales",

    title: "Increase Revenue",

    description:
      "Increase sales revenue by 20%",

    target: "20",

    uom: "PERCENTAGE",

    assignedEmployees: [
      "John Doe",
      "Michael Brown",
    ],

    status: "ACTIVE",
  },
];

export default function AdminSharedGoalsPage() {
  const [sharedGoals, setSharedGoals] =
    useState(mockSharedGoals);

  const [open, setOpen] =
    useState(false);

  const [selectedEmployees, setSelectedEmployees] =
    useState<string[]>([]);

  const [goalData, setGoalData] =
    useState({
      goalType:
        "COMPANY" as
          | "COMPANY"
          | "DEPARTMENT",

      department: "",

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

  const getFilteredEmployees =
    () => {
      if (
        goalData.goalType ===
        "COMPANY"
      ) {
        return mockEmployees;
      }

      return mockEmployees.filter(
        (employee) =>
          employee.department ===
          goalData.department
      );
    };

  const handleCreateGoal = () => {
    /*
    =====================================================

    BACKEND API

    POST /api/admin/shared-goals

    Request

    {
      goalType:
        "COMPANY" | "DEPARTMENT",

      department,

      title,

      description,

      target,

      uom,

      assignedEmployeeIds:[]
    }

    Response

    {
      success:true
    }

    =====================================================
    */

    const newGoal: SharedGoal = {
      id:
        "SG" +
        String(
          sharedGoals.length + 1
        ).padStart(3, "0"),

      goalType:
        goalData.goalType,

      department:
        goalData.department,

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
      goalType: "COMPANY",
      department: "",
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
        Shared Goals Management
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Create company-wide or
        department-wide goals and
        assign them to employees.
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
                Goal Type
              </TableCell>

              <TableCell>
                Goal Title
              </TableCell>

              <TableCell>
                Department
              </TableCell>

              <TableCell>
                Target
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
            {sharedGoals.map(
              (goal) => (
                <TableRow
                  key={goal.id}
                >
                  <TableCell>
                    <Chip
                      label={
                        goal.goalType
                      }
                      color={
                        goal.goalType ===
                        "COMPANY"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {goal.title}
                  </TableCell>

                  <TableCell>
                    {goal.department ||
                      "All Departments"}
                  </TableCell>

                  <TableCell>
                    {goal.target}
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
              )
            )}
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
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControl
                fullWidth
              >
                <InputLabel>
                  Goal Type
                </InputLabel>

                <Select
                  value={
                    goalData.goalType
                  }
                  label="Goal Type"
                  onChange={(e) =>
                    setGoalData({
                      ...goalData,
                      goalType:
                        e.target
                          .value as
                          | "COMPANY"
                          | "DEPARTMENT",
                    })
                  }
                >
                  <MenuItem value="COMPANY">
                    Company Goal
                  </MenuItem>

                  <MenuItem value="DEPARTMENT">
                    Department Goal
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {goalData.goalType ===
              "DEPARTMENT" && (
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <FormControl
                  fullWidth
                >
                  <InputLabel>
                    Department
                  </InputLabel>

                  <Select
                    value={
                      goalData.department
                    }
                    label="Department"
                    onChange={(e) =>
                      setGoalData({
                        ...goalData,
                        department:
                          e.target
                            .value,
                      })
                    }
                  >
                    <MenuItem value="Sales">
                      Sales
                    </MenuItem>

                    <MenuItem value="Engineering">
                      Engineering
                    </MenuItem>

                    <MenuItem value="HR">
                      HR
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

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
                multiline
                rows={3}
                fullWidth
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

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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
                Assign Employees
              </Typography>

              {getFilteredEmployees().map(
                (
                  employee
                ) => (
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
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}