"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

export default function ManagerDashboard() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Manager Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Team Members
              </Typography>

              <Typography variant="h3">
                15
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Pending Approvals
              </Typography>

              <Typography variant="h3">
                4
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Check-in Reviews
              </Typography>

              <Typography variant="h3">
                7
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Team Progress
              </Typography>

              <Typography variant="h3">
                74%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6">
          Team Insights
        </Typography>

        <Typography sx={{ mt: 2 }}>
          3 goals are below expected progress.
          Review pending check-ins this week.
        </Typography>
      </Paper>
    </Box>
  );
}