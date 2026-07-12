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

const qoqData = [
  {
    quarter: "Q1",
    achievement: 68,
  },
  {
    quarter: "Q2",
    achievement: 74,
  },
  {
    quarter: "Q3",
    achievement: 81,
  },
  {
    quarter: "Q4",
    achievement: 87,
  },
];

const thrustAreaData = [
  {
    thrustArea: "Sales",
    goals: 42,
  },
  {
    thrustArea: "Engineering",
    goals: 35,
  },
  {
    thrustArea: "Operations",
    goals: 28,
  },
  {
    thrustArea: "HR",
    goals: 15,
  },
];

const managerData = [
  {
    manager: "Manager A",
    teamSize: 12,
    checkinCompletion: 95,
  },
  {
    manager: "Manager B",
    teamSize: 10,
    checkinCompletion: 88,
  },
  {
    manager: "Manager C",
    teamSize: 15,
    checkinCompletion: 72,
  },
];

export default function AnalyticsPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Analytics Dashboard
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Organization-wide performance,
        goal distribution and manager
        effectiveness analytics.
      </Alert>

      {/*
      ======================================

      BACKEND APIS

      GET /api/analytics/qoq

      Response

      [
        {
          quarter,
          achievement
        }
      ]

      --------------------------------------

      GET /api/analytics/thrust-areas

      Response

      [
        {
          thrustArea,
          goals
        }
      ]

      --------------------------------------

      GET /api/analytics/managers

      Response

      [
        {
          manager,
          teamSize,
          checkinCompletion
        }
      ]

      ======================================
      */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Total Employees
              </Typography>

              <Typography variant="h3">
                150
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Active Goals
              </Typography>

              <Typography variant="h3">
                624
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Completion Rate
              </Typography>

              <Typography variant="h3">
                84%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Pending Check-ins
              </Typography>

              <Typography variant="h3">
                23
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 3,
          mt: 4,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Quarter-on-Quarter Goal Achievement
        </Typography>

        {qoqData.map((item) => (
          <Box
            key={item.quarter}
            sx={{ mb: 2 }}
          >
            <Typography>
              {item.quarter} -
              {" "}
              {item.achievement}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={item.achievement}
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Paper>

      <Paper
        sx={{
          p: 3,
          mt: 4,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Goal Distribution By Thrust Area
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Thrust Area
              </TableCell>

              <TableCell>
                Goals
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {thrustAreaData.map(
              (item) => (
                <TableRow
                  key={
                    item.thrustArea
                  }
                >
                  <TableCell>
                    {
                      item.thrustArea
                    }
                  </TableCell>

                  <TableCell>
                    {item.goals}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper
        sx={{
          p: 3,
          mt: 4,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Manager Effectiveness
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Manager
              </TableCell>

              <TableCell>
                Team Size
              </TableCell>

              <TableCell>
                Check-in Completion
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {managerData.map(
              (manager) => (
                <TableRow
                  key={
                    manager.manager
                  }
                >
                  <TableCell>
                    {
                      manager.manager
                    }
                  </TableCell>

                  <TableCell>
                    {
                      manager.teamSize
                    }
                  </TableCell>

                  <TableCell>
                    {
                      manager.checkinCompletion
                    }
                    %
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