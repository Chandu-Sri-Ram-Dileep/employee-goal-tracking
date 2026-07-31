"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Chip,
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
  Typography,
  CircularProgress,
  Avatar,
  Tooltip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

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

const ACTION_COLOR: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
  CHECKIN_APPROVED: "success",
  CHECKIN_RETURNED: "warning",
  UNLOCK_REQUEST_ADMIN_APPROVED: "success",
  UNLOCK_REQUEST_ADMIN_REJECTED: "error",
  UNLOCK_REQUEST_MANAGER_APPROVED: "success",
  UNLOCK_REQUEST_MANAGER_REJECTED: "error",
  UNLOCK_REQUEST_CREATED: "info",
  PROFILE_UPDATED: "info",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterAction, setFilterAction] = useState("ALL");

  const { data: logs = [], isLoading, isError } = useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueRoles = Array.from(new Set(logs.map((l) => l.user.role)));

  const filtered = logs.filter((log) => {
    const matchSearch =
      search === "" ||
      log.user.name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (log.remarks?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRole = filterRole === "ALL" || log.user.role === filterRole;
    const matchAction = filterAction === "ALL" || log.action === filterAction;
    return matchSearch && matchRole && matchAction;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex" }}>
          <HistoryIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            System Audit Logs
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Complete activity trail across all employees, managers and admins.
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: "Total Events", value: logs.length },
          { label: "Unique Users", value: new Set(logs.map((l) => l.user.email)).size },
          { label: "Showing", value: filtered.length },
        ].map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 130, textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by user, action, entity…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <TextField
          select
          size="small"
          label="Role"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          sx={{ minWidth: 130 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment> } }}
        >
          <MenuItem value="ALL">All Roles</MenuItem>
          {uniqueRoles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>
        <TextField
          select
          size="small"
          label="Action"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          sx={{ minWidth: 200 }}
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
        <Alert severity="error">Failed to load audit logs.</Alert>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No audit logs match your filters.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: "primary.light" }}>
                        {getInitials(log.user.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {log.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.user.role}
                      size="small"
                      color={log.user.role === "ADMIN" ? "error" : log.user.role === "MANAGER" ? "warning" : "default"}
                      sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatAction(log.action)}
                      size="small"
                      color={ACTION_COLOR[log.action] ?? "default"}
                      variant="outlined"
                      sx={{ fontSize: "0.65rem", maxWidth: 200 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={log.entityType} size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={log.remarks ?? ""} placement="top">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {log.remarks || "—"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}