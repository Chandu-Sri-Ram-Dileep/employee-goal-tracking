"use client";

import {
  Alert,
  Box,
  Chip,
  Paper,
  Typography,
} from "@mui/material";

interface AuditLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    action: "Goal Sheet Created",
    module: "Goals",
    timestamp:
      "2026-06-15 10:30 AM",
  },

  {
    id: "2",
    action: "Goal Sheet Submitted",
    module: "Goals",
    timestamp:
      "2026-06-15 11:00 AM",
  },

  {
    id: "3",
    action: "Check-in Submitted",
    module: "Check-ins",
    timestamp:
      "2026-06-20 04:15 PM",
  },
];

export default function EmployeeAuditLogs() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        My Audit Logs
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        View your activity history.
      </Alert>

      {mockLogs.map((log) => (
        <Paper
          key={log.id}
          sx={{
            p: 2,
            mb: 2,
          }}
        >
          <Typography>
            {log.action}
          </Typography>

          <Chip
            label={log.module}
            sx={{ mt: 1 }}
          />

          <Typography
            variant="body2"
            sx={{ mt: 1 }}
          >
            {log.timestamp}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}