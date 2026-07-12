"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

interface TeamMember {
  id: string;
  employeeName: string;
  department: string;
  goalsAssigned: number;
  goalsCompleted: number;
  progress: number;
}

const teamData: TeamMember[] = [
  {
    id: "EMP001",
    employeeName: "John Doe",
    department: "Sales",
    goalsAssigned: 5,
    goalsCompleted: 4,
    progress: 80,
  },

  {
    id: "EMP002",
    employeeName: "Jane Smith",
    department: "Engineering",
    goalsAssigned: 6,
    goalsCompleted: 5,
    progress: 83,
  },

  {
    id: "EMP003",
    employeeName: "Alex Johnson",
    department: "Operations",
    goalsAssigned: 4,
    goalsCompleted: 2,
    progress: 50,
  },
];

export default function ManagerReportsPage() {
  const totalEmployees =
    teamData.length;

  const avgProgress = Math.round(
    teamData.reduce(
      (sum, emp) =>
        sum + emp.progress,
      0
    ) / teamData.length
  );

  const totalGoalsAssigned =
    teamData.reduce(
      (sum, emp) =>
        sum + emp.goalsAssigned,
      0
    );

  const totalGoalsCompleted =
    teamData.reduce(
      (sum, emp) =>
        sum + emp.goalsCompleted,
      0
    );

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Team Reports
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Review team performance,
        goal completion and overall
        progress.
      </Alert>

      {/*
      ==================================

      BACKEND APIS

      GET /api/reports/team-summary

      Response

      {
        totalEmployees,
        avgProgress,
        totalGoalsAssigned,
        totalGoalsCompleted
      }

      ----------------------------------

      GET /api/reports/team-progress

      Response

      [
        {
          id,
          employeeName,
          department,
          goalsAssigned,
          goalsCompleted,
          progress
        }
      ]

      ==================================
      */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Team Members
              </Typography>

              <Typography variant="h3">
                {totalEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Goals Assigned
              </Typography>

              <Typography variant="h3">
                {totalGoalsAssigned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Goals Completed
              </Typography>

              <Typography variant="h3">
                {totalGoalsCompleted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Avg Progress
              </Typography>

              <Typography variant="h3">
                {avgProgress}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mt: 4,
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Team Progress Overview
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Employee
              </TableCell>

              <TableCell>
                Department
              </TableCell>

              <TableCell>
                Goals Assigned
              </TableCell>

              <TableCell>
                Goals Completed
              </TableCell>

              <TableCell>
                Progress
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {teamData.map(
              (employee) => (
                <TableRow
                  key={employee.id}
                >
                  <TableCell>
                    {
                      employee.employeeName
                    }
                  </TableCell>

                  <TableCell>
                    {
                      employee.department
                    }
                  </TableCell>

                  <TableCell>
                    {
                      employee.goalsAssigned
                    }
                  </TableCell>

                  <TableCell>
                    {
                      employee.goalsCompleted
                    }
                  </TableCell>

                  <TableCell>
                    <Typography>
                      {
                        employee.progress
                      }
                      %
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={
                        employee.progress
                      }
                      sx={{
                        mt: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}