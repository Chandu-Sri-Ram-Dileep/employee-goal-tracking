"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

export default function EmployeeDashboard() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Employee Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                My Goals
              </Typography>

              <Typography variant="h3">
                6
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Completed Goals
              </Typography>

              <Typography variant="h3">
                2
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Progress
              </Typography>

              <Typography variant="h3">
                67%
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
                1
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6">
          Latest Feedback
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Great progress on revenue goals.
          Continue focusing on customer acquisition.
        </Typography>
      </Paper>
    </Box>
  );
}