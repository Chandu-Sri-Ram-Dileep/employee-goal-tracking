"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

interface TeamGoal {
  id: string;

  employeeName: string;

  employeeCode: string;

  department: string;

  goalTitle: string;

  description: string;

  target: string;

  achievement: string;

  progress: number;

  weightage: number;

  status:
    | "NOT_STARTED"
    | "ON_TRACK"
    | "COMPLETED";
}

const mockTeamGoals: TeamGoal[] = [
  {
    id: "TG001",

    employeeName: "John Doe",

    employeeCode: "EMP001",

    department: "Sales",

    goalTitle: "Increase Revenue",

    description:
      "Increase annual revenue by 20%",

    target: "20%",

    achievement: "12%",

    progress: 60,

    weightage: 40,

    status: "ON_TRACK",
  },

  {
    id: "TG002",

    employeeName: "John Doe",

    employeeCode: "EMP001",

    department: "Sales",

    goalTitle: "Acquire Clients",

    description:
      "Acquire 50 enterprise clients",

    target: "50",

    achievement: "35",

    progress: 70,

    weightage: 60,

    status: "ON_TRACK",
  },

  {
    id: "TG003",

    employeeName: "Jane Smith",

    employeeCode: "EMP002",

    department: "Engineering",

    goalTitle: "Reduce Bugs",

    description:
      "Reduce production bugs by 30%",

    target: "30%",

    achievement: "28%",

    progress: 93,

    weightage: 50,

    status: "COMPLETED",
  },

  {
    id: "TG004",

    employeeName: "Michael Brown",

    employeeCode: "EMP003",

    department: "Operations",

    goalTitle:
      "Improve Delivery Time",

    description:
      "Reduce delivery time by 15%",

    target: "15%",

    achievement: "2%",

    progress: 13,

    weightage: 50,

    status: "NOT_STARTED",
  },
];

export default function TeamGoalsPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Team Goals
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Monitor goals, progress,
        and achievements of your
        reporting employees.
      </Alert>

      {/*
      ====================================

      BACKEND API

      GET /api/manager/team-goals

      Response

      [
        {
          id,
          employeeName,
          employeeCode,
          department,
          goalTitle,
          description,
          target,
          achievement,
          progress,
          weightage,
          status
        }
      ]

      ====================================
      */}

      <Grid container spacing={3}>
        {mockTeamGoals.map(
          (goal) => (
            <Grid
              key={goal.id}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                  >
                    {goal.goalTitle}
                  </Typography>

                  <Typography>
                    Employee:
                    {" "}
                    {
                      goal.employeeName
                    }
                  </Typography>

                  <Typography>
                    Employee Code:
                    {" "}
                    {
                      goal.employeeCode
                    }
                  </Typography>

                  <Typography>
                    Department:
                    {" "}
                    {
                      goal.department
                    }
                  </Typography>

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    {
                      goal.description
                    }
                  </Typography>

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    Target:
                    {" "}
                    {goal.target}
                  </Typography>

                  <Typography>
                    Achievement:
                    {" "}
                    {
                      goal.achievement
                    }
                  </Typography>

                  <Typography>
                    Weightage:
                    {" "}
                    {
                      goal.weightage
                    }
                    %
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography>
                      Progress:
                      {" "}
                      {goal.progress}
                      %
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={
                        goal.progress
                      }
                      sx={{
                        mt: 1,
                      }}
                    />
                  </Box>

                  <Chip
                    sx={{
                      mt: 2,
                    }}
                    label={goal.status}
                    color={
                      goal.status ===
                      "COMPLETED"
                        ? "success"
                        : goal.status ===
                          "ON_TRACK"
                        ? "warning"
                        : "default"
                    }
                  />

                  <Box
                    sx={{
                      mt: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                    >
                      View Goal Details
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