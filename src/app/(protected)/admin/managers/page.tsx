"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Tooltip,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonOnIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { exportToCsv } from "@/lib/exportCsv";
import { exportToPdf } from "@/lib/exportPdf";
import ManagerDetailModal from "@/components/common/ManagerDetailModal";

interface Employee {
  id: string;

  employeeCode: string;

  user: {
    name: string;
    email: string;
  };
}

interface Manager {
  id: string;

  managerCode: string;

  department: string;

  gender: string;

  phone?: string;

  address?: string;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;

  user: {
    id: string;

    name: string;

    email: string;
  };

  employees: Employee[];
}

const emptyManager = {
  id: "",

  name: "",

  email: "",

  department: "",

  gender: "MALE",

  phone: "",

  address: "",
};

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingManager, setEditingManager] = useState<any>(emptyManager);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    managerCode: string;
    temporaryPassword: string;
  } | null>(null);

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  const fetchManagers = async () => {
    try {
      const response = await fetch("/api/admin/managers");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setManagers(data);
      } else {
        setManagers([]);
      }
    } catch (error) {
      console.error(error);
      setManagers([]);
    }
  };

  useEffect(() => {
    fetchManagers().finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    setEditingManager(emptyManager);
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager({
      id: manager.id,
      name: manager.user.name,
      email: manager.user.email,
      department: manager.department,
      gender: manager.gender,
      phone: manager.phone || "",
      address: manager.address || "",
    });

    setIsEditMode(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        const response = await fetch("/api/admin/managers/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            managerId: editingManager.id,
            name: editingManager.name,
            email: editingManager.email,
            department: editingManager.department,
            gender: editingManager.gender,
            phone: editingManager.phone,
            address: editingManager.address,
            status: "ACTIVE",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          alert(data.message || "Update failed");
          return;
        }

        await fetchManagers();
        setOpen(false);
        setSnackbarMessage("Manager updated successfully");
        return;
      }

      const response = await fetch("/api/admin/managers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingManager.name,
          email: editingManager.email,
          department: editingManager.department,
          gender: editingManager.gender,
          phone: editingManager.phone,
          address: editingManager.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Creation failed");
        return;
      }

      setGeneratedCredentials({
        managerCode: data.manager.managerCode,
        temporaryPassword: data.temporaryPassword,
      });

      setCredentialsOpen(true);
      setOpen(false);
      await fetchManagers();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (manager: Manager) => {
    try {
      const endpoint =
        manager.status === "ACTIVE"
          ? "/api/admin/managers/deactivate"
          : "/api/admin/managers/activate";

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: manager.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Status change failed");
        return;
      }

      await fetchManagers();
      setSnackbarMessage(
        manager.status === "ACTIVE"
          ? "Manager deactivated successfully"
          : "Manager activated successfully"
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Manager Management
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Create managers, assign employees, view team execution analytics, and manage manager profiles.
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6">Total Managers: {managers.length}</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Export as CSV">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() =>
                exportToCsv(
                  "managers",
                  managers.map((m) => ({
                    Code: m.managerCode,
                    Name: m.user.name,
                    Email: m.user.email,
                    Department: m.department,
                    Status: m.status,
                    TeamSize: m.employees.length,
                  }))
                )
              }
            >
              CSV
            </Button>
          </Tooltip>
          <Tooltip title="Export as PDF">
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              onClick={() =>
                exportToPdf(
                  "Manager_Directory",
                  managers.map((m) => ({
                    Code: m.managerCode,
                    Name: m.user.name,
                    Email: m.user.email,
                    Department: m.department,
                    Status: m.status,
                    TeamSize: m.employees.length,
                  }))
                )
              }
            >
              PDF
            </Button>
          </Tooltip>
          <Button variant="contained" onClick={handleCreate}>
            Add Manager
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by code, name, email, department..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {managers
                .filter((mgr) => {
                  if (!searchTerm) return true;
                  const term = searchTerm.toLowerCase();
                  return (
                    mgr.managerCode.toLowerCase().includes(term) ||
                    mgr.user.name.toLowerCase().includes(term) ||
                    mgr.user.email.toLowerCase().includes(term) ||
                    mgr.department.toLowerCase().includes(term)
                  );
                })
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((manager) => (
                  <TableRow key={manager.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{manager.managerCode}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        onClick={() => setDetailModalId(manager.id)}
                        sx={{ color: "warning.main", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      >
                        {manager.user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{manager.user.email}</TableCell>
                    <TableCell>{manager.department}</TableCell>
                    <TableCell>{manager.gender}</TableCell>
                    <TableCell>{manager.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Chip label={`${manager.employees?.length ?? 0} Direct Reports`} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip label={manager.status} color={manager.status === "ACTIVE" ? "success" : "error"} size="small" />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="View Full Manager Profile & Team History">
                        <IconButton color="info" onClick={() => setDetailModalId(manager.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Manager">
                        <IconButton color="primary" onClick={() => handleEdit(manager)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={manager.status === "ACTIVE" ? "Deactivate Manager" : "Activate Manager"}>
                        <IconButton color={manager.status === "ACTIVE" ? "error" : "success"} onClick={() => toggleStatus(manager)}>
                          {manager.status === "ACTIVE" ? <PersonOffIcon /> : <PersonOnIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={
              managers.filter((mgr) => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return (
                  mgr.managerCode.toLowerCase().includes(term) ||
                  mgr.user.name.toLowerCase().includes(term) ||
                  mgr.user.email.toLowerCase().includes(term) ||
                  mgr.department.toLowerCase().includes(term)
                );
              }).length
            }
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Manager" : "Add New Manager"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Full Name" value={editingManager.name} onChange={(e) => setEditingManager({ ...editingManager, name: e.target.value })} />
          <TextField fullWidth margin="normal" label="Email" value={editingManager.email} onChange={(e) => setEditingManager({ ...editingManager, email: e.target.value })} disabled={isEditMode} />
          <TextField fullWidth margin="normal" label="Department" value={editingManager.department} onChange={(e) => setEditingManager({ ...editingManager, department: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select value={editingManager.gender} label="Gender" onChange={(e) => setEditingManager({ ...editingManager, gender: e.target.value })}>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth margin="normal" label="Phone" value={editingManager.phone} onChange={(e) => setEditingManager({ ...editingManager, phone: e.target.value })} />
          <TextField fullWidth margin="normal" label="Address" value={editingManager.address} onChange={(e) => setEditingManager({ ...editingManager, address: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{isEditMode ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onClose={() => setCredentialsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Manager Created Successfully</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share these generated credentials with the new manager:
          </Typography>
          {generatedCredentials && (
            <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2">Manager Code: <strong>{generatedCredentials.managerCode}</strong></Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Temporary Password: <strong>{generatedCredentials.temporaryPassword}</strong></Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCredentialsOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Manager Detail Modal */}
      <ManagerDetailModal managerId={detailModalId} open={Boolean(detailModalId)} onClose={() => setDetailModalId(null)} />

      <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={3000} onClose={() => setSnackbarMessage("")} message={snackbarMessage} />
    </Box>
  );
}