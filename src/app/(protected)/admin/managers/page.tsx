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
import PersonOnIcon from "@mui/icons-material/Person";

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

  const [editingManager, setEditingManager] =
    useState<any>(emptyManager);

  const [
    generatedCredentials,
    setGeneratedCredentials,
  ] = useState<{
    managerCode: string;
    temporaryPassword: string;
  } | null>(null);

  const [
    credentialsOpen,
    setCredentialsOpen,
  ] = useState(false);

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

        await fetchManagers();

        setLoading(false);
      };

      loadData();
  }, []);

  const handleCreate = () => {
    setEditingManager(
      emptyManager
    );

    setIsEditMode(false);

    setOpen(true);
  };

  const handleEdit = (
    manager: Manager
  ) => {
    setEditingManager({
      id: manager.id,

      name:
        manager.user.name,

      email:
        manager.user.email,

      department:
        manager.department,

      gender:
        manager.gender,

      phone:
        manager.phone || "",

      address:
        manager.address || "",

      status:
        manager.status,
    });

    setIsEditMode(true);

    setOpen(true);
  };
    const handleSave =
    async () => {
      try {
        if (
          isEditMode
        ) {
          const response =
            await fetch(
              "/api/admin/managers/update",
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  managerId:
                    editingManager.id,

                  name:
                    editingManager.name,

                  email:
                    editingManager.email,

                  department:
                    editingManager.department,

                  gender:
                    editingManager.gender,

                  phone:
                    editingManager.phone,

                  address:
                    editingManager.address,

                  status:
                    editingManager.status,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            alert(
              data.message
            );
            return;
          }

          setSnackbarMessage(
            "Manager updated successfully"
          );
        } else {
          const response =
            await fetch(
              "/api/admin/managers/create",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  name:
                    editingManager.name,

                  email:
                    editingManager.email,

                  department:
                    editingManager.department,

                  gender:
                    editingManager.gender,

                  phone:
                    editingManager.phone,

                  address:
                    editingManager.address,
                }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            alert(
              data.message
            );
            return;
          }

          setGeneratedCredentials(
            {
              managerCode:
                data.managerCode,

              temporaryPassword:
                data.temporaryPassword,
            }
          );

          setCredentialsOpen(
            true
          );

          setSnackbarMessage(
            "Manager created successfully"
          );
        }

        setOpen(false);

        fetchManagers();
      } catch (
        error
      ) {
        console.error(
          error
        );

        alert(
          "Something went wrong"
        );
      }
    };

  const toggleStatus =
    async (
      manager: Manager
    ) => {const actionText = manager.status === "ACTIVE" ? "deactivate" : "activate";
  
  const confirmed = window.confirm(
    `Are you sure you want to ${actionText} this manager?`
  );

  if (!confirmed) return;

      try {
       const nextStatus =
      manager.status ===
      "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";


        const response =
          await fetch(
             "/api/admin/managers/deactivate",
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                managerId:
                  manager.id,
                   status:
              nextStatus,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          alert(
            data.message
          );
          return;
        }

        fetchManagers();
      } catch (
        error
      ) {
        console.error(
          error
        );
      }
    };

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
        Manager Management
      </Typography>

      <Alert
        severity="info"
        sx={{
          mb: 3,
        }}
      >
        Create managers,
        assign employees,
        manage status and
        maintain manager
        profiles.
      </Alert>

      <Box
        sx={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          mb: 3,
        }}
      >
        <Typography
          variant="h6"
        >
          Total Managers:
          {" "}
          {
            managers.length
          }
        </Typography>

        <Button
          variant="contained"
          onClick={
            handleCreate
          }
        >
          Add Manager
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display:
              "flex",

            justifyContent:
              "center",

            mt: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Manager
                  Code
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
                  Gender
                </TableCell>

                <TableCell>
                  Phone
                </TableCell>

                <TableCell>
                  Employees
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Created
                </TableCell>

                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {managers.map(
                (
                  manager
                ) => (
                  <TableRow
                    key={
                      manager.id
                    }
                  >
                    <TableCell>
                      {
                        manager.managerCode
                      }
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/admin/managers/${manager.id}`}
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
                          manager
                            .user
                            .name
                        }
                      </Link>
                    </TableCell>

                    <TableCell>
                      {
                        manager
                          .user
                          .email
                      }
                    </TableCell>

                    <TableCell>
                      {
                        manager.department
                      }
                    </TableCell>

                    <TableCell>
                      {
                        manager.gender
                      }
                    </TableCell>

                    <TableCell>
                      {manager.phone ||
                        "-"}
                    </TableCell>
                                        <TableCell>
                      {manager
                        .employees
                        .length ===
                      0 ? (
                        "-"
                      ) : (
                        <Box>
                          {manager.employees.map(
                            (
                              employee
                            ) => (
                              <Box
                                key={
                                  employee.id
                                }
                              >
                                <Link
                                  href={`/admin/employees/${employee.id}`}
                                  style={{
                                    textDecoration:
                                      "none",
                                    color:
                                      "#1976d2",
                                  }}
                                >
                                  {
                                    employee
                                      .user
                                      .name
                                  }
                                </Link>
                              </Box>
                            )
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          manager.status
                        }
                        color={
                          manager.status ===
                          "ACTIVE"
                            ? "success"
                            : "error"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(
                        manager.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Tooltip title="Edit Manager">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleEdit(
                              manager
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          manager.status ===
                          "ACTIVE"
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        <IconButton
                          color={
                            manager.status ===
                            "ACTIVE"
                              ? "error"
                              : "success"
                          }
                          onClick={() =>
                            toggleStatus(
                              manager
                            )
                          }
                        >
                          {manager.status ===
                          "ACTIVE" ? (
                            <PersonOffIcon />
                          ) : (
                            <PersonOnIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog
        open={open}
        onClose={() =>
          setOpen(false)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode
            ? "Edit Manager"
            : "Create Manager"}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Name"
              value={
                editingManager.name
              }
              onChange={(e) =>
                setEditingManager({
                  ...editingManager,
                  name:
                    e.target.value,
                })
              }
            />

            <TextField
              label="Email"
              value={
                editingManager.email
              }
              onChange={(e) =>
                setEditingManager({
                  ...editingManager,
                  email:
                    e.target.value,
                })
              }
            />

            <TextField
              label="Department"
              value={
                editingManager.department
              }
              onChange={(e) =>
                setEditingManager({
                  ...editingManager,
                  department:
                    e.target.value,
                })
              }
            />

            <FormControl
              fullWidth
            >
              <InputLabel>
                Gender
              </InputLabel>

              <Select
                label="Gender"
                value={
                  editingManager.gender
                }
                onChange={(e) =>
                  setEditingManager({
                    ...editingManager,
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
                editingManager.phone
              }
              onChange={(e) =>
                setEditingManager({
                  ...editingManager,
                  phone:
                    e.target.value,
                })
              }
            />

            <TextField
              label="Address"
              multiline
              rows={3}
              value={
                editingManager.address
              }
              onChange={(e) =>
                setEditingManager({
                  ...editingManager,
                  address:
                    e.target.value,
                })
              }
            />

            {/* {isEditMode && (
              <FormControl
                fullWidth
              >
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  label="Status"
                  value={
                    editingManager.status
                  }
                  onChange={(e) =>
                    setEditingManager({
                      ...editingManager,
                      status:
                        e.target
                          .value,
                    })
                  }
                >
                  <MenuItem value="ACTIVE">
                    ACTIVE
                  </MenuItem>

                  <MenuItem value="INACTIVE">
                    INACTIVE
                  </MenuItem>
                </Select>
              </FormControl>
            )} */}
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
            onClick={
              handleSave
            }
          >
            {isEditMode
              ? "Update"
              : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          credentialsOpen
        }
        onClose={() =>
          setCredentialsOpen(
            false
          )
        }
      >
        <DialogTitle>
          Manager Created
        </DialogTitle>

        <DialogContent>
          <Typography>
            Save these
            credentials.
          </Typography>

          <Box
            sx={{
              mt: 2,
            }}
          >
            <Typography>
              <strong>
                Manager
                Code:
              </strong>{" "}
              {
                generatedCredentials?.managerCode
              }
            </Typography>

            <Button
              size="small"
              onClick={() =>
                copyText(
                  generatedCredentials?.managerCode ||
                    ""
                )
              }
            >
              Copy Code
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2,
            }}
          >
            <Typography>
              <strong>
                Password:
              </strong>{" "}
              {
                generatedCredentials?.temporaryPassword
              }
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
          </Box>
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
            variant="contained"
            onClick={() =>
              setCredentialsOpen(
                false
              )
            }
          >
            OK
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