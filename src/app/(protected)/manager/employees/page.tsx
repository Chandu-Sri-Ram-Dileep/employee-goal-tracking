"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  goalSheetStatus:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED";

  checkinStatus:
    | "PENDING"
    | "SUBMITTED"
    | "APPROVED";

  overallProgress: number;
}

const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    employeeCode: "E1001",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Sales",
    designation: "Sales Executive",
    goalSheetStatus: "APPROVED",
    checkinStatus: "APPROVED",
    overallProgress: 78,
  },

  {
    id: "EMP002",
    employeeCode: "E1002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Engineering",
    designation: "Software Engineer",
    goalSheetStatus: "APPROVED",
    checkinStatus: "SUBMITTED",
    overallProgress: 65,
  },

  {
    id: "EMP003",
    employeeCode: "E1003",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    department: "Operations",
    designation: "Operations Executive",
    goalSheetStatus: "SUBMITTED",
    checkinStatus: "PENDING",
    overallProgress: 42,
  },

  {
    id: "EMP004",
    employeeCode: "E1004",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "Finance",
    designation: "Finance Analyst",
    goalSheetStatus: "APPROVED",
    checkinStatus: "APPROVED",
    overallProgress: 88,
  },
];

export default function MyEmployeesPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        My Employees
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        View employees reporting to
        you along with goal and
        performance status.
      </Alert>

      {/*
      ===================================

      BACKEND API

      GET /api/manager/my-employees

      Response

      [
        {
          id,
          employeeCode,
          name,
          email,
          department,
          designation,
          goalSheetStatus,
          checkinStatus,
          overallProgress
        }
      ]

      ===================================
      */}

      <Grid container spacing={3}>
        {mockEmployees.map(
          (employee) => (
            <Grid
              key={employee.id}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems:
                        "center",
                      mb: 2,
                    }}
                  >
                    <Avatar>
                      {employee.name[0]}
                    </Avatar>

                    <Box>
                      <Typography variant="h6">
                        {
                          employee.name
                        }
                      </Typography>

                      <Typography
                        color="text.secondary"
                      >
                        {
                          employee.employeeCode
                        }
                      </Typography>
                    </Box>
                  </Box>

                  <Typography>
                    Email:
                    {" "}
                    {employee.email}
                  </Typography>

                  <Typography>
                    Department:
                    {" "}
                    {
                      employee.department
                    }
                  </Typography>

                  <Typography>
                    Designation:
                    {" "}
                    {
                      employee.designation
                    }
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography>
                      Goal Sheet Status
                    </Typography>

                    <Chip
                      sx={{ mt: 1 }}
                      label={
                        employee.goalSheetStatus
                      }
                      color={
                        employee.goalSheetStatus ===
                        "APPROVED"
                          ? "success"
                          : employee.goalSheetStatus ===
                            "SUBMITTED"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography>
                      Check-in Status
                    </Typography>

                    <Chip
                      sx={{ mt: 1 }}
                      label={
                        employee.checkinStatus
                      }
                      color={
                        employee.checkinStatus ===
                        "APPROVED"
                          ? "success"
                          : employee.checkinStatus ===
                            "SUBMITTED"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                    }}
                  >
                    <Typography>
                      Overall Goal Progress
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={
                        employee.overallProgress
                      }
                      sx={{
                        mt: 1,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 1,
                      }}
                    >
                      {
                        employee.overallProgress
                      }
                      %
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                    >
                      View Goals
                    </Button>

                    <Button
                      variant="contained"
                    >
                      View Performance
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
}