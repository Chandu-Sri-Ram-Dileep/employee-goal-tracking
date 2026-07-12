"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: number;
  achievement: number;
  weightage: number;
  progress: number;
  status: string;
  managerFeedback?: string;
}

interface CheckinWindow {
  id: string;
  period: string;
  openDate: string;
  closeDate: string;
}

interface GoalSheet {
  id: string;

  status: string;

  employee: {
    id: string;

    employeeCode: string;

    department: string;

    user: {
      name: string;
      email: string;
    };

    manager?: {
      user: {
        name: string;
      };
    };
  };

  goals: Goal[];
}

interface GoalCycle {
  id: string;

  name: string;

  description: string | null;

  startDate: string;

  endDate: string;

  goalOpenDate: string;

  goalCloseDate: string;

  status: string;

  createdAt: string;

  updatedAt: string;

  checkinWindows: CheckinWindow[];

  goalSheets: GoalSheet[];
}
export default function GoalCycleProfilePage() {
  const params = useParams();

  const cycleId =
    params.id as string;

  const [loading, setLoading] =
    useState(true);

  const [cycle, setCycle] =
    useState<GoalCycle | null>(
      null
    );

  const [openEdit, setOpenEdit] =
    useState(false);

  const [editData, setEditData] =
    useState<any>(null);

  const [
    selectedGoalSheet,
    setSelectedGoalSheet,
  ] =
    useState<GoalSheet | null>(
      null
    );

  const [
    openGoalDialog,
    setOpenGoalDialog,
  ] = useState(false);

  const fetchCycle =
    async () => {
      try {
        const response =
          await fetch(
            `/api/admin/goal-cycles/${cycleId}`
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setCycle(data);

        setEditData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (cycleId) {
      fetchCycle();
    }
  }, [cycleId]);

  const activateCycle =
    async () => {
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

      fetchCycle();
    };

  const closeCycle =
    async () => {
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

      fetchCycle();
    };

  const deleteCycle =
    async () => {
      if (
        !window.confirm(
          "Delete this Goal Cycle?"
        )
      ) {
        return;
      }

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

      window.location.href =
        "/admin/goal-cycles";
    };

  const openGoalSheet =
    (
      goalSheet: GoalSheet
    ) => {
      setSelectedGoalSheet(
        goalSheet
      );

      setOpenGoalDialog(
        true
      );
    };

  if (loading) {
    return (
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
    );
  }

  if (!cycle) {
    return (
      <Alert severity="error">
        Goal Cycle not found
      </Alert>
    );
  }

  const approvedGoalSheets =
    cycle.goalSheets.filter(
      (goalSheet) =>
        goalSheet.status ===
        "APPROVED"
    );

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Goal Cycle Details
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        Manage Goal Cycle,
        approved Goal Sheets and
        Check-in Windows.
      </Alert>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={() =>
            setOpenEdit(true)
          }
        >
          Edit
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={
            activateCycle
          }
        >
          Activate
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={
            closeCycle
          }
        >
          Close
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={
            deleteCycle
          }
        >
          Delete
        </Button>
      </Box>

      <Grid
        container
        spacing={3}
      />
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                Cycle Information
              </Typography>

              <Typography>
                <strong>
                  Name:
                </strong>{" "}
                {cycle.name}
              </Typography>

              <Typography>
                <strong>
                  Description:
                </strong>{" "}
                {cycle.description ??
                  "-"}
              </Typography>

              <Typography>
                <strong>
                  Start Date:
                </strong>{" "}
                {new Date(
                  cycle.startDate
                ).toLocaleDateString()}
              </Typography>

              <Typography>
                <strong>
                  End Date:
                </strong>{" "}
                {new Date(
                  cycle.endDate
                ).toLocaleDateString()}
              </Typography>

              <Typography>
                <strong>
                  Goal Open:
                </strong>{" "}
                {new Date(
                  cycle.goalOpenDate
                ).toLocaleDateString()}
              </Typography>

              <Typography>
                <strong>
                  Goal Close:
                </strong>{" "}
                {new Date(
                  cycle.goalCloseDate
                ).toLocaleDateString()}
              </Typography>

              <Box sx={{ mt: 2 }}>
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
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                Statistics
              </Typography>

              <Typography>
                <strong>
                  Approved Goal
                  Sheets:
                </strong>{" "}
                {
                  approvedGoalSheets.length
                }
              </Typography>

              <Typography>
                <strong>
                  Total Goal
                  Sheets:
                </strong>{" "}
                {
                  cycle.goalSheets.length
                }
              </Typography>

              <Typography>
                <strong>
                  Total Goals:
                </strong>{" "}
                {approvedGoalSheets.reduce(
                  (
                    total,
                    sheet
                  ) =>
                    total +
                    (sheet.goals?.length ?? 0),0
                )}
              </Typography>

              <Typography>
                <strong>
                  Check-in
                  Windows:
                </strong>{" "}
                {
                  cycle
                    .checkinWindows
                    .length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
                <Grid
          size={{
            xs: 12,
          }}
        >
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Check-in Windows
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Quarter
                  </TableCell>

                  <TableCell>
                    Open Date
                  </TableCell>

                  <TableCell>
                    Close Date
                  </TableCell>

                  <TableCell align="center">
                    Approved Goal Sheets
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cycle.checkinWindows.map(
                  (
                    window
                  ) => (
                    <TableRow
                      key={
                        window.id
                      }
                    >
                      <TableCell>
                        {
                          window.period
                        }
                      </TableCell>

                      <TableCell>
                        {new Date(
                          window.openDate
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {new Date(
                          window.closeDate
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell
                        align="center"
                      >
                        <Chip
                          color="primary"
                          label={
                            approvedGoalSheets.length
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid
          size={{
            xs: 12,
          }}
        >
          <Paper
            sx={{ p: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Approved Goal Sheets
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Goal Sheet
                  </TableCell>

                  <TableCell>
                    Employee
                  </TableCell>

                  <TableCell>
                    Department
                  </TableCell>

                  <TableCell>
                    Manager
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                  <TableCell
                    align="center"
                  >
                    Goals
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {approvedGoalSheets.length ===
                0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        6
                      }
                      align="center"
                    >
                      No Approved Goal
                      Sheets Found
                    </TableCell>
                  </TableRow>
                ) : (
                  approvedGoalSheets.map(
                    (
                      goalSheet,
                      index
                    ) => (
                      <TableRow
                        key={
                          goalSheet.id
                        }
                      >
                        <TableCell>
                          GS-
                          {String(
                            index +
                              1
                          ).padStart(
                            4,
                            "0"
                          )}
                        </TableCell>

                        <TableCell>
                          {
                            goalSheet
                              .employee
                              .user
                              .name
                          }
                        </TableCell>

                        <TableCell>
                          {
                            goalSheet
                              .employee
                              .department
                          }
                        </TableCell>

                        <TableCell>

                          {goalSheet.
                           employee.manager
                    ?.user.name ??
                    "Not Assigned"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              goalSheet.status
                            }
                            color={
                              goalSheet.status ===
                              "APPROVED"
                                ? "success"
                                : goalSheet.status ===
                                  "RETURNED"
                                ? "warning"
                                : goalSheet.status ===
                                  "SUBMITTED"
                                ? "info"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell
                          align="center"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              openGoalSheet(
                                goalSheet
                              )
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
              <Dialog
        open={openGoalDialog}
        onClose={() =>
          setOpenGoalDialog(false)
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Goal Sheet Details
        </DialogTitle>

        <DialogContent>
          {selectedGoalSheet && (
            <Box sx={{ mt: 1 }}>
              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2">
                    Goal Sheet
                  </Typography>

                  <Typography>
                    GS-
                    {String(
                      approvedGoalSheets.findIndex(
                        (g) =>
                          g.id ===
                          selectedGoalSheet.id
                      ) + 1
                    ).padStart(4, "0")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2">
                    Employee
                  </Typography>

                  <Typography>
                    {
                      selectedGoalSheet
                        .employee.user.name
                    }
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2">
                    Department
                  </Typography>

                  <Typography>
                    {
                      selectedGoalSheet
                        .employee.department
                    }
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2">
                    Manager
                  </Typography>

                  <Typography>
                    {selectedGoalSheet
                      .employee.manager?.user
                      .name ?? "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2">
                    Status
                  </Typography>

                  <Chip
                    label={
                      selectedGoalSheet.status
                    }
                    color={
                      selectedGoalSheet.status ===
                      "APPROVED"
                        ? "success"
                        : selectedGoalSheet.status ===
                          "RETURNED"
                        ? "warning"
                        : selectedGoalSheet.status ===
                          "SUBMITTED"
                        ? "info"
                        : "default"
                    }
                  />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                gutterBottom
              >
                Goals
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Goal
                    </TableCell>

                    <TableCell>
                      Thrust Area
                    </TableCell>

                    <TableCell>
                      UOM
                    </TableCell>

                    <TableCell>
                      Target
                    </TableCell>

                    <TableCell>
                      Weightage
                    </TableCell>

                    <TableCell>
                      Achievement
                    </TableCell>

                    <TableCell>
                      Progress
                    </TableCell>

                    <TableCell>
                      Status
                    </TableCell>

                    <TableCell>
                      Manager Feedback
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedGoalSheet.goals.map(
                    (goal) => (
                      <TableRow
                        key={goal.id}
                      >
                        <TableCell>
                          {goal.title}
                        </TableCell>

                        <TableCell>
                          {
                            goal.thrustArea
                          }
                        </TableCell>

                        <TableCell>
                          {goal.uom}
                        </TableCell>

                        <TableCell>
                          {goal.target}
                        </TableCell>

                        <TableCell>
                          {
                            goal.weightage
                          }
                          %
                        </TableCell>

                        <TableCell>
                          {
                            goal.achievement
                          }
                        </TableCell>

                        <TableCell sx={{ minWidth: 170 }}>
                          <Typography
                            variant="body2"
                          >
                            {
                              goal.progress
                            }
                            %
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(
                              goal.progress,
                              100
                            )}
                            sx={{ mt: 1 }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              goal.status
                            }
                            size="small"
                            color={
                              goal.status ===
                              "COMPLETED"
                                ? "success"
                                : goal.status ===
                                  "ON_TRACK"
                                ? "primary"
                                : "default"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {goal.managerFeedback ||
                            "-"}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenGoalDialog(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
            <Dialog
        open={openEdit}
        onClose={() =>
          setOpenEdit(false)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Goal Cycle
        </DialogTitle>

        <DialogContent>
          {editData && (
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
                  editData.name
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    name:
                      e.target.value,
                  })
                }
              />

              <TextField
                label="Description"
                value={
                  editData.description ??
                  ""
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    description:
                      e.target.value,
                  })
                }
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
                  editData.startDate
                    ?.split("T")[0]
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
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
                  editData.endDate?.split(
                    "T"
                  )[0]
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
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
                  editData.goalOpenDate?.split(
                    "T"
                  )[0]
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
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
                  editData.goalCloseDate?.split(
                    "T"
                  )[0]
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    goalCloseDate:
                      e.target.value,
                  })
                }
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenEdit(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              try {
                const response =
                  await fetch(
                    "/api/admin/goal-cycles/update",
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type":
                          "application/json",
                      },
                      body: JSON.stringify(
                        {
                          cycleId:
                            cycle.id,
                          ...editData,
                        }
                      ),
                    }
                  );

                if (
                  !response.ok
                ) {
                  alert(
                    "Failed to update Goal Cycle"
                  );
                  return;
                }

                setOpenEdit(
                  false
                );

                fetchCycle();
              } catch (
                error
              ) {
                console.error(
                  error
                );
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}