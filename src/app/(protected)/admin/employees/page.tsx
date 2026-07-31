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
import EmployeeDetailModal from "@/components/common/EmployeeDetailModal";

interface Manager {
  id: string;
  managerCode: string;

  user: {
    name: string;
    email: string;
  };
}

interface Employee {
  id: string;

  employeeCode: string;

  department: string;

  designation: string;

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

  manager?: {
    id: string;

    managerCode: string;

    user: {
      name: string;
      email: string;
    };
  } | null;
}

const emptyEmployee = {
  id: "",

  name: "",

  email: "",

  department: "",

  designation: "",

  gender: "MALE",

  phone: "",

  address: "",

  managerId: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<any>(emptyEmployee);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    employeeCode: string;
    temporaryPassword: string;
  } | null>(null);

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error(error);
      setEmployees([]);
    }
  };

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
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchManagers()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleCreate = () => {
    setEditingEmployee(emptyEmployee);
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee({
      id: employee.id,
      name: employee.user.name,
      email: employee.user.email,
      department: employee.department,
      designation: employee.designation,
      gender: employee.gender,
      phone: employee.phone || "",
      address: employee.address || "",
      managerId: employee.manager?.id || "",
    });

    setIsEditMode(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        const response = await fetch("/api/admin/employees/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: editingEmployee.id,
            name: editingEmployee.name,
            email: editingEmployee.email,
            department: editingEmployee.department,
            designation: editingEmployee.designation,
            gender: editingEmployee.gender,
            phone: editingEmployee.phone,
            address: editingEmployee.address,
            managerId: editingEmployee.managerId,
            status: "ACTIVE",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          alert(data.message || "Update failed");
          return;
        }
        await fetchEmployees();
        setOpen(false);
        setSnackbarMessage("Employee updated successfully");
        return;
      }

      const response = await fetch("/api/admin/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingEmployee.name,
          email: editingEmployee.email,
          department: editingEmployee.department,
          designation: editingEmployee.designation,
          gender: editingEmployee.gender,
          phone: editingEmployee.phone,
          address: editingEmployee.address,
          managerId: editingEmployee.managerId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Creation failed");
        return;
      }

      setGeneratedCredentials({
        employeeCode: data.employee.employeeCode,
        temporaryPassword: data.temporaryPassword,
      });

      setCredentialsOpen(true);
      setOpen(false);
      await fetchEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (employee: Employee) => {
    try {
      const endpoint =
        employee.status === "ACTIVE"
          ? "/api/admin/employees/deactivate"
          : "/api/admin/employees/activate";

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Status change failed");
        return;
      }

      await fetchEmployees();
      setSnackbarMessage(
        employee.status === "ACTIVE"
          ? "Employee deactivated successfully"
          : "Employee activated successfully"
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage("Copied to clipboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Employee Management
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Create employees, assign managers, manage status, and view complete employee performance history.
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6">Total Employees: {employees.length}</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Export as CSV">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() =>
                exportToCsv(
                  "employees",
                  employees.map((e) => ({
                    Code: e.employeeCode,
                    Name: e.user.name,
                    Email: e.user.email,
                    Department: e.department,
                    Designation: e.designation,
                    Status: e.status,
                    Manager: e.manager?.user.name ?? "Unassigned",
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
                  "Employee_Directory",
                  employees.map((e) => ({
                    Code: e.employeeCode,
                    Name: e.user.name,
                    Email: e.user.email,
                    Department: e.department,
                    Designation: e.designation,
                    Status: e.status,
                    Manager: e.manager?.user.name ?? "Unassigned",
                  }))
                )
              }
            >
              PDF
            </Button>
          </Tooltip>
          <Button variant="contained" onClick={handleCreate}>
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Search & Filter Bar */}
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

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date of Joining</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees
              .filter((emp) => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return (
                  emp.employeeCode.toLowerCase().includes(term) ||
                  emp.user.name.toLowerCase().includes(term) ||
                  emp.user.email.toLowerCase().includes(term) ||
                  emp.department.toLowerCase().includes(term) ||
                  emp.designation.toLowerCase().includes(term)
                );
              })
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{employee.employeeCode}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      onClick={() => setDetailModalId(employee.id)}
                      sx={{ color: "primary.main", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >
                      {employee.user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{employee.user.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.gender}</TableCell>
                  <TableCell>{employee.manager?.user.name ?? "Not Assigned"}</TableCell>
                  <TableCell>
                    <Chip label={employee.status} color={employee.status === "ACTIVE" ? "success" : "error"} size="small" />
                  </TableCell>
                  <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="View Full Employee Profile & History">
                      <IconButton color="info" onClick={() => setDetailModalId(employee.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Employee">
                      <IconButton color="primary" onClick={() => handleEdit(employee)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={employee.status === "ACTIVE" ? "Deactivate Employee" : "Activate Employee"}>
                      <IconButton color={employee.status === "ACTIVE" ? "error" : "success"} onClick={() => toggleStatus(employee)}>
                        {employee.status === "ACTIVE" ? <PersonOffIcon /> : <PersonOnIcon />}
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
            employees.filter((emp) => {
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                emp.employeeCode.toLowerCase().includes(term) ||
                emp.user.name.toLowerCase().includes(term) ||
                emp.user.email.toLowerCase().includes(term) ||
                emp.department.toLowerCase().includes(term) ||
                emp.designation.toLowerCase().includes(term)
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

      {/* Employee Dialog (Add / Edit) */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Full Name" value={editingEmployee.name} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} />
          <TextField fullWidth margin="normal" label="Email" value={editingEmployee.email} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} disabled={isEditMode} />
          <TextField fullWidth margin="normal" label="Department" value={editingEmployee.department} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} />
          <TextField fullWidth margin="normal" label="Designation" value={editingEmployee.designation} onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select value={editingEmployee.gender} label="Gender" onChange={(e) => setEditingEmployee({ ...editingEmployee, gender: e.target.value })}>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth margin="normal" label="Phone" value={editingEmployee.phone} onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })} />
          <TextField fullWidth margin="normal" label="Address" value={editingEmployee.address} onChange={(e) => setEditingEmployee({ ...editingEmployee, address: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Manager</InputLabel>
            <Select value={editingEmployee.managerId} label="Assign Manager" onChange={(e) => setEditingEmployee({ ...editingEmployee, managerId: e.target.value })}>
              <MenuItem value=""><em>None</em></MenuItem>
              {managers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.user.name} ({m.managerCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{isEditMode ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Generated Credentials Dialog */}
      <Dialog open={credentialsOpen} onClose={() => setCredentialsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Employee Created Successfully</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share these generated credentials with the new employee:
          </Typography>
          {generatedCredentials && (
            <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2">Employee Code: <strong>{generatedCredentials.employeeCode}</strong></Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Temporary Password: <strong>{generatedCredentials.temporaryPassword}</strong></Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCredentialsOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal employeeId={detailModalId} open={Boolean(detailModalId)} onClose={() => setDetailModalId(null)} />

      <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={3000} onClose={() => setSnackbarMessage("")} message={snackbarMessage} />
    </Box>
  );
}