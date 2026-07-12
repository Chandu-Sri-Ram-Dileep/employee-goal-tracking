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
  userName: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    userName: "Manager User",
    role: "MANAGER",
    action:
      "Approved Goal Sheet",
    module: "Goals",
    timestamp:
      "2026-06-15 11:30 AM",
  },

  {
    id: "2",
    userName: "John Doe",
    role: "EMPLOYEE",
    action:
      "Submitted Check-in",
    module: "Check-ins",
    timestamp:
      "2026-06-20 04:15 PM",
  },
];

export default function ManagerAuditLogs() {
  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Team Audit Logs
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        View employee and manager
        activities.
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
            User:
            {" "}
            {log.userName}
          </Typography>

          <Typography>
            Action:
            {" "}
            {log.action}
          </Typography>

          <Chip
            label={log.role}
            sx={{ mt: 1 }}
          />

          <Chip
            label={log.module}
            sx={{
              mt: 1,
              ml: 1,
            }}
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