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
  Tooltip,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonOnIcon from"@mui/icons-material/Person";
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
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [managers, setManagers] =
    useState<Manager[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  const [isEditMode, setIsEditMode] =
    useState(false);
  const [snackbarMessage, setSnackbarMessage] =
      useState("");
  const [editingEmployee, setEditingEmployee] =
    useState<any>(emptyEmployee);
  const [
    generatedCredentials,
    setGeneratedCredentials,
  ] = useState<{
    employeeCode: string;
    temporaryPassword: string;
  } | null>(null);

  const [
    credentialsOpen,
    setCredentialsOpen,
  ] = useState(false);

  const fetchEmployees =
    async () => {
      try {
        const response =
          await fetch(
            "/api/admin/employees"
          );

        const data =
          await response.json();

        setEmployees(data);
      } catch (error) {
        console.error(error);
      }
    };

  const fetchManagers =
    async () => {
      try {
        const response =
          await fetch(
            "/api/admin/managers"
          );

        const data =
          await response.json();

        setManagers(data);
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    const loadData =
      async () => {
        setLoading(true);

        await Promise.all([
          fetchEmployees(),
          fetchManagers(),
        ]);

        setLoading(false);
      };

    loadData();
  }, []);

  const handleCreate = () => {
    setEditingEmployee(
      emptyEmployee
    );

    setIsEditMode(false);

    setOpen(true);
  };

  const handleEdit = (
    employee: Employee
  ) => {
    setEditingEmployee({
      id: employee.id,

      name:
        employee.user.name,

      email:
        employee.user.email,

      department:
        employee.department,

      designation:
        employee.designation,

      gender:
        employee.gender,

      phone:
        employee.phone || "",

      address:
        employee.address || "",

      managerId:
        employee.manager?.id ||
        "",
    });

    setIsEditMode(true);

    setOpen(true);
  };
  const handleSave = async () => {
  try {
    if (isEditMode) {
      const response = await fetch(
        "/api/admin/employees/update",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            employeeId:
              editingEmployee.id,

            name:
              editingEmployee.name,

            email:
              editingEmployee.email,

            department:
              editingEmployee.department,

            designation:
              editingEmployee.designation,

            gender:
              editingEmployee.gender,

            phone:
              editingEmployee.phone,

            address:
              editingEmployee.address,

            managerId:
              editingEmployee.managerId,

            status: "ACTIVE",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Update failed"
        );
        return;
      }
      await fetchEmployees();
      setOpen(false);
       setSnackbarMessage(
          "Employee updated successfully"
        );
      return;
    }

    const response = await fetch(
      "/api/admin/employees/create",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name:
            editingEmployee.name,

          email:
            editingEmployee.email,

          department:
            editingEmployee.department,

          designation:
            editingEmployee.designation,

          gender:
            editingEmployee.gender,

          phone:
            editingEmployee.phone,

          address:
            editingEmployee.address,

          managerId:
            editingEmployee.managerId,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Creation failed"
      );
      return;
    }

    setGeneratedCredentials({
      employeeCode:
        data.employeeCode,

      temporaryPassword:
        data.temporaryPassword,
    });

    setCredentialsOpen(true);

    await fetchEmployees();

    setOpen(false);
  } catch (error) {
    console.error(error);
    alert(
      "Something went wrong"
    );
  }
};

const toggleStatus = async (
  employee: Employee
) => {  const actionText = employee.status === "ACTIVE" ? "deactivate" : "activate";
  
  const confirmed = window.confirm(
    `Are you sure you want to ${actionText} thisemployee?`
  );

  if (!confirmed) return;
  try {
    const nextStatus =
      employee.status ===
      "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const response =
      await fetch(
        "/api/admin/employees/deactivate",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            employeeId:
              employee.id,

            status:
              nextStatus,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Failed"
      );

      return;
    }

    await fetchEmployees();
  } catch (error) {
    console.error(error);
  }
};

if (loading) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "center",

        alignItems:
          "center",

        height: "60vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
 const copyText =
    async (
      text: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          text
        );

        setSnackbarMessage(
          "Copied to clipboard"
        );
      } catch (
        error
      ) {
        console.error(
          error
        );
      }
    };
return (
  <Box>
    <Typography
      variant="h4"
      gutterBottom
    >
      Employee Management
    </Typography>

    <Alert
      severity="info"
      sx={{ mb: 3 }}
    >
      Create employees, assign
      managers and manage
      employee status.
    </Alert>

    <Box
      sx={{
        display: "flex",
        justifyContent:
          "space-between",
        mb: 3,
      }}
    >
      <Typography variant="h6">
        Total Employees:{" "}
        {employees.length}
      </Typography>

      <Button
        variant="contained"
        onClick={handleCreate}
      >
        Add Employee
      </Button>
    </Box>
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Employee Code
            </TableCell>

            <TableCell>
              Name
            </TableCell>

            <TableCell>
              Email
            </TableCell>

            <TableCell>
              Department
            </TableCell>

            <TableCell>
              Designation
            </TableCell>

            <TableCell>
              Gender
            </TableCell>

            <TableCell>
              Manager
            </TableCell>

            <TableCell>
              Status
            </TableCell>

             <TableCell>
             Date of Joining
             </TableCell>

            <TableCell>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {employees.map(
            (employee) => (
              <TableRow
                key={employee.id}
              >
                <TableCell>
                  {
                    employee.employeeCode
                  }
                </TableCell>

                <TableCell>
                  <Link
                    href={`/admin/employees/${employee.id}`}
                    style={{
                      textDecoration:
                        "none",
                      color:
                        "#1976d2",
                      fontWeight:
                        600,
                    }}
                  >
                    {
                      employee.user
                        .name
                    }
                  </Link>
                </TableCell>

                <TableCell>
                  {
                    employee.user
                      .email
                  }
                </TableCell>

                <TableCell>
                  {
                    employee.department
                  }
                </TableCell>

                <TableCell>
                  {
                    employee.designation
                  }
                </TableCell>

                <TableCell>
                  {employee.gender}
                </TableCell>

                <TableCell>
                  {employee.manager
                    ?.user.name ??
                    "Not Assigned"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      employee.status
                    }
                    color={
                      employee.status ===
                      "ACTIVE"
                        ? "success"
                        : "error"
                    }
                  />
                </TableCell>
                 <TableCell>
                      {new Date(
                        employee.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                <TableCell>
                  {/* <Button
                    size="small"
                    onClick={() =>
                      handleEdit(
                        employee
                      )
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() =>
                      toggleStatus(
                        employee
                      )
                    }
                  >
                    {employee.status ===
                    "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                  </Button> */}
                  <Tooltip title="Edit Employee">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleEdit(employee)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={employee.status === "ACTIVE" ? "Deactivate Employee" : "Activate Employee"}>
  <IconButton
    color={employee.status === "ACTIVE" ? "error" : "success"} // Optional: turns red for deactivate, green for activate
    onClick={() => toggleStatus(employee)}
  >
    {employee.status === "ACTIVE" ? <PersonOffIcon /> : <PersonOnIcon />}
  </IconButton>
</Tooltip>

                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Paper>

    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isEditMode
          ? "Edit Employee"
          : "Create Employee"}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label="Name"
            value={
              editingEmployee.name
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                name:
                  e.target.value,
              })
            }
          />

          <TextField
            label="Email"
            value={
              editingEmployee.email
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                email:
                  e.target.value,
              })
            }
          />

          <TextField
            label="Department"
            value={
              editingEmployee.department
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                department:
                  e.target.value,
              })
            }
          />

          <TextField
            label="Designation"
            value={
              editingEmployee.designation
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                designation:
                  e.target.value,
              })
            }
          />

          <FormControl>
            <InputLabel>
              Gender
            </InputLabel>

            <Select
              label="Gender"
              value={
                editingEmployee.gender
              }
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  gender:
                    e.target.value,
                })
              }
            >
              <MenuItem value="MALE">
                Male
              </MenuItem>

              <MenuItem value="FEMALE">
                Female
              </MenuItem>

              <MenuItem value="OTHER">
                Other
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Phone"
            value={
              editingEmployee.phone
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                phone:
                  e.target.value,
              })
            }
          />

          <TextField
            label="Address"
            value={
              editingEmployee.address
            }
            onChange={(e) =>
              setEditingEmployee({
                ...editingEmployee,
                address:
                  e.target.value,
              })
            }
          />

          <FormControl>
            <InputLabel>
              Manager
            </InputLabel>

            <Select
              label="Manager"
              value={
                editingEmployee.managerId
              }
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  managerId:
                    e.target.value,
                })
              }
            >
              <MenuItem value="">
                None
              </MenuItem>

              {managers.map(
                (manager) => (
                  <MenuItem
                    key={
                      manager.id
                    }
                    value={
                      manager.id
                    }
                  >
                    {
                      manager.user
                        .name
                    }{" "}
                    (
                    {
                      manager.managerCode
                    }
                    )
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() =>
            setOpen(false)
          }
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={credentialsOpen}
      onClose={() =>
        setCredentialsOpen(
          false
        )
      }
    >
      <DialogTitle>
        Employee Created
      </DialogTitle>

      <DialogContent>
        <Typography>
          Employee Code:
          <strong>
            {" "}
            {
              generatedCredentials?.employeeCode
            }
          </strong>
        </Typography>
         <Button
                      size="small"
                      onClick={() =>
                        copyText(
                          generatedCredentials?.employeeCode ||
                            ""
                        )
                      }
                    >
                      Copy Code
                    </Button>
        <Typography
          sx={{ mt: 2 }}
        >
          Temporary Password:
          <strong>
            {" "}
            {
              generatedCredentials?.temporaryPassword
            }
          </strong>
        </Typography>
         <Button
              size="small"
              onClick={() =>
                copyText(
                  generatedCredentials?.temporaryPassword ||
                    ""
                )
              }
            >
              Copy Password
            </Button>

        <Alert
          severity="warning"
          sx={{ mt: 2 }}
        >
          Save this password.
          It will not be shown
          again.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() =>
            setCredentialsOpen(
              false
            )
          }
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  <Snackbar
  open={snackbarMessage !== ""}
  autoHideDuration={3000}
  onClose={() => setSnackbarMessage("")}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  sx={{ marginTop: '64px' }} 
>
  <Alert
    severity="success"
    onClose={() => setSnackbarMessage("")}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
  </Box>
);
}