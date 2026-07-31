"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/material";
import { exportToCsv } from "@/lib/exportCsv";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  remarks?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const ACTION_COLOR: Record<string, string> = {
  CHECKIN_APPROVED: "#10b981",
  CHECKIN_RETURNED: "#f59e0b",
  GOAL_SHEET_CREATED: "#6366f1",
  GOAL_SHEET_SUBMITTED: "#38bdf8",
  UNLOCK_REQUEST_CREATED: "#818cf8",
  PROFILE_UPDATED: "#10b981",
};

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

export default function EmployeeAuditLogs() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  const { data: logs = [], isLoading, isError } = useQuery<AuditLog[]>({
    queryKey: ["employee-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/employee/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((log) => {
    const matchSearch =
      search === "" ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (log.remarks?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchAction = filterAction === "ALL" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <Box sx={{ color: "#fff" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex" }}>
            <HistoryIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Personal Activity Audit Trail
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)" }}>
              Immutable record of goal submissions, check-ins, unlock requests, and status transitions.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportToCsv("Audit_Logs", filtered)}
          sx={{ fontWeight: 700, color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by action, entity or remarks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 240, "& .MuiInputBase-root": { color: "#fff" } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> } }}
        />
        <TextField
          select
          size="small"
          label="Action"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          sx={{ minWidth: 200, "& .MuiInputBase-root": { color: "#fff" } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> } }}
        >
          <MenuItem value="ALL">All Actions</MenuItem>
          {uniqueActions.map((a) => <MenuItem key={a} value={a}>{formatAction(a)}</MenuItem>)}
        </TextField>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">Failed to load personal audit logs.</Alert>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", background: "linear-gradient(145deg, #111827, #0f172a)" }}>
          <HistoryIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.2)", mb: 1 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>No personal audit log entries match your filter.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ background: "linear-gradient(145deg, #111827, #0f172a)" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { color: "rgba(255,255,255,0.4)", fontWeight: 700 } }}>
                <TableCell>Action</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((log) => {
                const color = ACTION_COLOR[log.action] || "#9ca3af";
                return (
                  <TableRow key={log.id} hover sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                    <TableCell>
                      <Chip
                        label={formatAction(log.action)}
                        size="small"
                        sx={{
                          bgcolor: `${color}18`,
                          color,
                          border: `1px solid ${color}35`,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
                      {log.entityType}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={log.remarks ?? ""} placement="top">
                        <Typography
                          variant="body2"
                          sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.5)" }}
                        >
                          {log.remarks || "—"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}