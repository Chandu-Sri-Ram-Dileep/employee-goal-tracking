"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";

interface PerformanceRecord {
  id: string;

  reviewCycle: string;

  goalTitle: string;

  target: number;

  achievement: number;

  progress: number;

  managerRating: number;

  managerFeedback: string;

  lastUpdated: string;

  status:
    | "COMPLETED"
    | "IN_PROGRESS";
}

const mockPerformance: PerformanceRecord[] = [
  {
    id: "P001",

    reviewCycle: "Q1 2026",

    goalTitle: "Increase Revenue",

    target: 20,

    achievement: 18,

    progress: 90,

    managerRating: 4,

    managerFeedback:
      "Excellent effort. Nearly achieved target.",

    lastUpdated: "2026-06-15",

    status: "COMPLETED",
  },

  {
    id: "P002",

    reviewCycle: "Q1 2026",

    goalTitle: "Acquire Clients",

    target: 50,

    achievement: 40,

    progress: 80,

    managerRating: 4,

    managerFeedback:
      "Good progress. Focus on enterprise clients.",

    lastUpdated: "2026-06-18",

    status: "IN_PROGRESS",
  },
];

export default function EmployeePerformancePage() {
  const overallProgress =
    Math.round(
      mockPerformance.reduce(
        (sum, item) => sum + item.progress,
        0
      ) / mockPerformance.length
    );

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Performance History
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        View your goal achievements,
        progress, ratings and manager
        feedback.
      </Alert>

      {/*

      ==================================

      BACKEND API

      GET /api/performance/my-history

      Response

      [
        {
          id,
          reviewCycle,
          goalTitle,
          target,
          achievement,
          progress,
          managerRating,
          managerFeedback,
          lastUpdated,
          status
        }
      ]

      ==================================

      */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Overall Performance Summary
        </Typography>

        <Typography>
          Overall Goal Progress:
          {" "}
          {overallProgress}%
        </Typography>

        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{ mt: 1 }}
        />
      </Paper>

      <Grid container spacing={3}>
        {mockPerformance.map(
          (record) => (
            <Grid
              key={record.id}
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
                    {record.goalTitle}
                  </Typography>

                  <Typography>
                    Review Cycle:
                    {" "}
                    {record.reviewCycle}
                  </Typography>

                  <Typography>
                    Target:
                    {" "}
                    {record.target}
                  </Typography>

                  <Typography>
                    Achievement:
                    {" "}
                    {record.achievement}
                  </Typography>

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    Progress:
                    {" "}
                    {record.progress}%
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={
                      record.progress
                    }
                    sx={{ mt: 1 }}
                  />

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    Manager Rating:
                    {" "}
                    {record.managerRating}
                    /5
                  </Typography>

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    Manager Feedback:
                    {" "}
                    {
                      record.managerFeedback
                    }
                  </Typography>

                  <Typography
                    sx={{ mt: 2 }}
                  >
                    Last Updated:
                    {" "}
                    {record.lastUpdated}
                  </Typography>

                  <Chip
                    sx={{ mt: 2 }}
                    label={
                      record.status
                    }
                    color={
                      record.status ===
                      "COMPLETED"
                        ? "success"
                        : "warning"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
}