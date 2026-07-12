"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Employees
              </Typography>

              <Typography variant="h3">
                240
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Goal Cycles
              </Typography>

              <Typography variant="h3">
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Unlock Requests
              </Typography>

              <Typography variant="h3">
                5
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Departments
              </Typography>

              <Typography variant="h3">
                8
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6">
          System Overview
        </Typography>

        <Typography sx={{ mt: 2 }}>
          All PMS services are operational.
          No critical alerts detected.
        </Typography>
      </Paper>
    </Box>
  );
}