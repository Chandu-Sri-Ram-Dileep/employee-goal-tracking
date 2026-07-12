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
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface CheckinWindow {
  id: string;

  period: string;

  openDate: string;

  closeDate: string;
}

interface GoalCycle {
  id: string;

  name: string;

  description: string;

  startDate: string;

  endDate: string;

  goalOpenDate: string;

  goalCloseDate: string;

  status:
    | "DRAFT"
    | "ACTIVE"
    | "CLOSED";

  isActive: boolean;

  createdAt: string;

  checkinWindows: CheckinWindow[];

  goalSheets: {
    id: string;
  }[];
}

const emptyCycle = {
  name: "",

  description: "",

  startDate: "",

  endDate: "",

  goalOpenDate: "",

  goalCloseDate: "",

  q1OpenDate: "",

  q1CloseDate: "",

  q2OpenDate: "",

  q2CloseDate: "",

  q3OpenDate: "",

  q3CloseDate: "",

  q4OpenDate: "",

  q4CloseDate: "",
};

export default function GoalCyclesPage() {
  const [cycles, setCycles] =
    useState<GoalCycle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openCreate, setOpenCreate] =
    useState(false);

  const [successOpen, setSuccessOpen] =
    useState(false);

  const [formData, setFormData] =
    useState(emptyCycle);

  const fetchCycles =
    async () => {
      try {
        const response =
          await fetch(
            "/api/admin/goal-cycles"
          );

        const data =
          await response.json();

        setCycles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCycles();
  }, []);

  const createCycle =
    async () => {
      try {
        const response =
          await fetch(
            "/api/admin/goal-cycles/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                formData
              ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Failed to create Goal Cycle"
          );

          return;
        }

        setOpenCreate(false);

        setSuccessOpen(true);

        setFormData(
          emptyCycle
        );

        fetchCycles();
      } catch (error) {
        console.error(error);
      }
    };
      const activateCycle =
    async (
      cycleId: string
    ) => {
      try {
        await fetch(
          "/api/admin/goal-cycles/activate",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cycleId,
            }),
          }
        );

        fetchCycles();
      } catch (error) {
        console.error(error);
      }
    };

  const closeCycle =
    async (
      cycleId: string
    ) => {
      try {
        await fetch(
          "/api/admin/goal-cycles/close",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cycleId,
            }),
          }
        );

        fetchCycles();
      } catch (error) {
        console.error(error);
      }
    };

  const deleteCycle =
    async (
      cycleId: string
    ) => {
      const confirmed =
        window.confirm(
          "Delete this Goal Cycle?"
        );

      if (!confirmed) return;

      try {
        const response =
          await fetch(
            "/api/admin/goal-cycles/delete",
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                cycleId,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message
          );

          return;
        }

        fetchCycles();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Goal Cycle Management
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Manage appraisal cycles,
        activation, closure and
        employee goal periods.
      </Alert>

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Total Goal Cycles:
          {" "}
          {cycles.length}
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            setOpenCreate(true)
          }
        >
          Create Goal Cycle
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
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
                  Cycle Name
                </TableCell>

                <TableCell>
                  Start Date
                </TableCell>

                <TableCell>
                  End Date
                </TableCell>

                <TableCell>
                  Goal Window
                </TableCell>

                <TableCell>
                  Check-ins
                </TableCell>

                <TableCell>
                  Goal Sheets
                </TableCell>

                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {cycles.map(
                (cycle) => (
                  <TableRow
                    key={
                      cycle.id
                    }
                  >
                    <TableCell>
                      <Link
                        href={`/admin/goal-cycles/${cycle.id}`}
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
                          cycle.name
                        }
                      </Link>
                    </TableCell>

                    <TableCell>
                      {new Date(
                        cycle.startDate
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        cycle.endDate
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        cycle.goalOpenDate
                      ).toLocaleDateString()}
                      {" "}
                      -
                      {" "}
                      {new Date(
                        cycle.goalCloseDate
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {cycle.checkinWindows
                        ?.length || 0}
                    </TableCell>

                    <TableCell>
                      {cycle.goalSheets
                        ?.length || 0}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          cycle.status
                        }
                        color={
                          cycle.status ===
                          "ACTIVE"
                            ? "success"
                            : cycle.status ===
                                "CLOSED"
                              ? "error"
                              : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        component={
                          Link
                        }
                        href={`/admin/goal-cycles/${cycle.id}`}
                      >
                        View
                      </Button>

                      {!cycle.isActive && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() =>
                            activateCycle(
                              cycle.id
                            )
                          }
                        >
                          Activate
                        </Button>
                      )}

                      {cycle.status !==
                        "CLOSED" && (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() =>
                            closeCycle(
                              cycle.id
                            )
                          }
                        >
                          Close
                        </Button>
                      )}

                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          deleteCycle(
                            cycle.id
                          )
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
            <Dialog
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Create Goal Cycle
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
              label="Cycle Name"
              value={
                formData.name
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name:
                    e.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={
                formData.description
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description:
                    e.target.value,
                })
              }
              fullWidth
            />

            <TextField
              type="date"
              label="Start Date"
               slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.startDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="End Date"
              slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.endDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Goal Open Date"
               slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.goalOpenDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goalOpenDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Goal Close Date"
               slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.goalCloseDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goalCloseDate:
                    e.target.value,
                })
              }
            />
          </Box>

          <Typography
            variant="h6"
            sx={{ mt: 4, mb: 2 }}
          >
            Check-in Windows
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 2,
            }}
          >
            <TextField
              type="date"
              label="Q1 Open"
             slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q1OpenDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q1OpenDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q1 Close"
              slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q1CloseDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q1CloseDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q2 Open"
               slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q2OpenDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q2OpenDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q2 Close"
              slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q2CloseDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q2CloseDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q3 Open"
             slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q3OpenDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q3OpenDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q3 Close"
               slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q3CloseDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q3CloseDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q4 Open"
            slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q4OpenDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q4OpenDate:
                    e.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Q4 Close"
              slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
              value={
                formData.q4CloseDate
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  q4CloseDate:
                    e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenCreate(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              createCycle
            }
          >
            Create Goal Cycle
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() =>
          setSuccessOpen(false)
        }
      >
        <Alert severity="success">
          Goal Cycle created
          successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}